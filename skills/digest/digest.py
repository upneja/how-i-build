#!/usr/bin/env python3
"""
digest.py, Claude Code session digest.

Surfaces the small fraction of actions that actually matter (what got published,
deployed, spent, sent, or destroyed) so a long autonomous run never surprises you.

Subcommands:
  capture     PostToolUse hook. Reads stdin JSON, records outward/irreversible
              actions for the session. Silent, never errors out the tool flow.
  stop-hook   Stop hook. Writes the latest digest and pushes SMS+email for any
              NEW critical action. Never blocks (coexists with Ralph + goal hooks).
  emit        Print the current session's digest to stdout (used by /digest).
  push        Force-send the current digest via SMS + email.
  test        Send a test SMS + email to confirm the channels work.

Design notes:
  - stdlib only, so it runs from a bare hook subprocess with no venv.
  - Secrets are read in place from their existing homes (see config.env); this
    file never stores credentials.
  - Every path is absolute. Hook cwd is unpredictable.
"""
from __future__ import annotations
import os
import re
import sys
import json
import ssl
import base64
import smtplib
import subprocess
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timezone
from email.message import EmailMessage
from email.utils import formataddr

HOME = os.path.expanduser("~")
DIR = os.path.join(HOME, ".claude", "digest")
SESS = os.path.join(DIR, "sessions")
CONFIG = os.path.join(DIR, "config.env")
LATEST_PTR = os.path.join(SESS, "latest")
LATEST_MD = os.path.join(DIR, "latest.md")

os.makedirs(SESS, exist_ok=True)


# --------------------------------------------------------------------------- #
# Config / secrets (read in place, never stored here)
# --------------------------------------------------------------------------- #
def parse_env(path):
    out = {}
    try:
        with open(path) as fh:
            for line in fh:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    out[k.strip()] = v.strip().strip('"').strip("'")
    except OSError:
        pass
    return out


def cfg():
    c = parse_env(CONFIG)
    tw = parse_env(c.get("TWILIO_ENV", ""))
    gm = parse_env(c.get("GMAIL_ENV", ""))
    return {
        "SMS_TO": c.get("SMS_TO"),
        "EMAIL_TO": c.get("EMAIL_TO"),
        "PUSH": (c.get("DIGEST_PUSH") or "critical").lower(),
        "TWILIO_ACCOUNT_SID": tw.get("TWILIO_ACCOUNT_SID"),
        "TWILIO_AUTH_TOKEN": tw.get("TWILIO_AUTH_TOKEN"),
        "TWILIO_FROM": tw.get("TWILIO_FROM"),
        "GMAIL_ADDRESS": gm.get("GMAIL_ADDRESS"),
        "GMAIL_APP_PASSWORD": gm.get("GMAIL_APP_PASSWORD"),
    }


# --------------------------------------------------------------------------- #
# Classification, the heart of "surface the 1% that matters"
# --------------------------------------------------------------------------- #
# (compiled_regex, label). First match wins. Order matters: destructive first.
CRITICAL = [
    (r"rm\s+-rf\b", "Destructive: rm -rf"),
    (r"git\s+push\b.*(--force|\s-f\b|\+)", "Force-push (history rewrite)"),
    (r"git\s+reset\s+--hard", "git reset --hard"),
    (r"\b(drop\s+(table|database)|truncate\s+table)\b", "Destructive SQL"),
    (r"gh\s+repo\s+edit\b.*--visibility\s+public", "Repo made PUBLIC"),
    (r"gh\s+repo\s+create\b.*(--public|\s)", "New repo created"),
    (r"gh\s+release\s+create", "GitHub release published"),
    (r"npm\s+publish", "npm package published"),
    (r"(twine\s+upload|pip.*\supload|python\s+-m\s+twine)", "Python package published"),
    (r"vercel\b.*(--prod|\sdeploy)", "Vercel deploy"),
    (r"netlify\s+deploy", "Netlify deploy"),
    (r"(api\.porkbun\.com|porkbun|api\.godaddy|dnsimple|cloudflare.*dns)", "DNS change"),
    (r"(api\.stripe\.com|\bstripe\b.*(charge|payment|payout)|--amount)", "Spend / payment"),
    (r"(kalshi|polymarket).*(order|trade|buy|sell|place)", "Market order (spend)"),
    (r"(api\.twilio\.com|send_sms|twilio.*messages)", "SMS sent"),
    (r"(smtplib|sendmail|send_email|mail\s+-s|msmtp)", "Email sent"),
]
NOTED = [
    (r"git\s+push\b", "git push"),
    (r"gh\s+pr\s+create", "PR opened"),
    (r"gh\s+pr\s+merge", "PR merged"),
    (r"vercel\b", "Vercel preview"),
    (r"gh\s+repo\s+edit\b", "Repo settings changed"),
]
CRITICAL = [(re.compile(p, re.I), lbl) for p, lbl in CRITICAL]
NOTED = [(re.compile(p, re.I), lbl) for p, lbl in NOTED]


# Commands that only READ or print. If a segment starts with one of these, any
# scary string in it is data (an echo/grep/cat of a command), not an action.
READ_ONLY = {
    "echo", "printf", "cat", "bat", "tac", "nl", "ls", "grep", "rg", "egrep",
    "fgrep", "head", "tail", "sed", "awk", "less", "more", "find", "jq", "yq",
    "wc", "cut", "sort", "uniq", "diff", "tree", "stat", "file", "which", "type",
    "man", "column", "base64", "date", "env", "true", "false", "test", "open",
    "xxd", "od", "cmp", "comm", "tee", "printenv", "dirname", "basename",
}
PREFIXES = {"sudo", "command", "time", "nice", "nohup", "exec", "env", "then", "do", "if"}


def _strip_heredocs(cmd):
    # remove heredoc bodies so script content written to a file isn't classified
    return re.sub(r"<<-?\s*['\"]?(\w+)['\"]?.*?\n\s*\1\b", " ", cmd, flags=re.S)


def _segments(cmd):
    parts = re.split(r"(?:&&|\|\||[;|\n])", _strip_heredocs(cmd))
    return [p.strip() for p in parts if p.strip()]


def _first_token(seg):
    toks = seg.split()
    i = 0
    # skip leading VAR=val assignments and harmless prefixes (sudo, time, ...)
    while i < len(toks) and (("=" in toks[i] and not toks[i].startswith("-")) or toks[i] in PREFIXES):
        i += 1
    return toks[i].rsplit("/", 1)[-1] if i < len(toks) else ""


def classify(tool_name, command):
    if tool_name.startswith("mcp__") and "deploy_to_vercel" in tool_name:
        return "critical", "Vercel deploy (MCP)"
    if not command or "digest.py" in command:
        return None, None
    crit, noted = None, None
    for seg in _segments(command):
        if _first_token(seg) in READ_ONLY:
            continue
        # quoted argument text (commit messages, echo args, --notes "...") is data,
        # not commands. Strip it so a message mentioning "npm publish" can't trip.
        bare = re.sub(r'"[^"]*"', " ", re.sub(r"'[^']*'", " ", seg))
        if re.search(r"--dry-run", bare, re.I):
            continue
        if crit is None:
            for rx, lbl in CRITICAL:
                if rx.search(bare):
                    crit = lbl
                    break
        if crit is None and noted is None:
            for rx, lbl in NOTED:
                if rx.search(bare):
                    noted = lbl
                    break
    if crit:
        return "critical", crit
    return ("noted", noted) if noted else (None, None)


# --------------------------------------------------------------------------- #
# Session state
# --------------------------------------------------------------------------- #
def session_path(sid):
    safe = re.sub(r"[^A-Za-z0-9_.-]", "_", sid or "unknown")
    return os.path.join(SESS, f"{safe}.json")


def load_session(sid):
    try:
        with open(session_path(sid)) as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return None


def save_session(sid, data):
    tmp = session_path(sid) + ".tmp"
    with open(tmp, "w") as fh:
        json.dump(data, fh, indent=2)
    os.replace(tmp, session_path(sid))


def now_iso():
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def short_cmd(cmd, n=140):
    cmd = " ".join((cmd or "").split())
    return cmd[: n - 1] + "…" if len(cmd) > n else cmd


# --------------------------------------------------------------------------- #
# capture (PostToolUse)
# --------------------------------------------------------------------------- #
def capture():
    try:
        data = json.load(sys.stdin)
    except (ValueError, OSError):
        return  # malformed input: do nothing, never block the tool
    sid = data.get("session_id") or "unknown"
    cwd = data.get("cwd") or os.getcwd()
    tool = data.get("tool_name", "") or ""
    ti = data.get("tool_input") or {}
    command = ti.get("command") if isinstance(ti, dict) else ""
    out = data.get("tool_output") or data.get("tool_response") or {}
    exit_code = out.get("exit_code") if isinstance(out, dict) else None

    sess = load_session(sid) or {"sid": sid, "start": now_iso(), "cwd": cwd, "actions": []}
    sess["cwd"] = cwd  # track latest cwd

    level, label = classify(tool, command)
    if level:
        status = "ok" if exit_code in (0, None, "0") else "failed"
        sess["actions"].append({
            "time": now_iso(),
            "level": level,
            "label": label,
            "tool": tool,
            "cmd": short_cmd(command) if command else tool,
            "status": status,
            "pushed": False,
        })
    save_session(sid, sess)
    with open(LATEST_PTR, "w") as fh:
        fh.write(sid)


# --------------------------------------------------------------------------- #
# git context
# --------------------------------------------------------------------------- #
def git(cwd, *args):
    try:
        r = subprocess.run(["git", "-C", cwd, *args],
                           capture_output=True, text=True, timeout=8)
        return r.stdout.strip() if r.returncode == 0 else ""
    except Exception:
        return ""


def git_context(cwd, since_iso):
    if not cwd or not os.path.isdir(cwd):
        return None
    if git(cwd, "rev-parse", "--is-inside-work-tree") != "true":
        return None
    branch = git(cwd, "rev-parse", "--abbrev-ref", "HEAD")
    status = git(cwd, "status", "--short")
    commits = ""
    if since_iso:
        commits = git(cwd, "log", f"--since={since_iso}", "--oneline", "-30")
    if not commits:
        commits = git(cwd, "log", "--oneline", "-5")
    unpushed = git(cwd, "log", "@{u}..HEAD", "--oneline") if branch else ""
    return {
        "branch": branch,
        "status": [l for l in status.splitlines() if l.strip()],
        "commits": [l for l in commits.splitlines() if l.strip()],
        "unpushed": [l for l in unpushed.splitlines() if l.strip()],
    }


# --------------------------------------------------------------------------- #
# Build digest
# --------------------------------------------------------------------------- #
def resolve_sid(arg=None):
    if arg:
        return arg
    try:
        with open(LATEST_PTR) as fh:
            return fh.read().strip()
    except OSError:
        return None


def build(sid):
    sess = load_session(sid) if sid else None
    if not sess:
        return None
    cwd = sess.get("cwd") or os.getcwd()
    actions = sess.get("actions", [])
    crit = [a for a in actions if a["level"] == "critical"]
    noted = [a for a in actions if a["level"] == "noted"]
    g = git_context(cwd, sess.get("start"))
    return {"sid": sid, "cwd": cwd, "start": sess.get("start"),
            "critical": crit, "noted": noted, "git": g, "all": actions}


def render_full(d):
    proj = os.path.basename(d["cwd"].rstrip("/")) or d["cwd"]
    L = []
    L.append(f"RUN DIGEST · {proj} · {datetime.now().astimezone().strftime('%Y-%m-%d %H:%M')}")
    L.append("=" * 52)
    crit = d["critical"]
    if crit:
        L.append("\n⚠  OUTWARD / IRREVERSIBLE")
        for a in crit:
            mark = "" if a["status"] == "ok" else "  (FAILED)"
            L.append(f"  • {a['label']}{mark}")
            L.append(f"      {a['cmd']}")
    else:
        L.append("\nOutward / irreversible:  none")
    if d["noted"]:
        L.append("\nRoutine outward:")
        for a in d["noted"]:
            L.append(f"  • {a['label']}: {a['cmd']}")
    g = d["git"]
    if g:
        L.append(f"\nGit ({g['branch'] or '?'}):")
        if g["commits"]:
            L.append(f"  Commits this session: {len(g['commits'])}")
            for c in g["commits"][:8]:
                L.append(f"    {c}")
        if g["unpushed"]:
            L.append(f"  Unpushed: {len(g['unpushed'])} commit(s)")
        if g["status"]:
            L.append(f"  Uncommitted changes: {len(g['status'])} file(s)")
            for s in g["status"][:8]:
                L.append(f"    {s}")
        if not (g["commits"] or g["status"]):
            L.append("  clean, no commits this session")
    # spend/send tallies
    tally = {}
    for a in crit:
        if a["status"] != "ok":
            continue
        for key in ("Spend", "SMS sent", "Email sent", "Market order"):
            if key.lower() in a["label"].lower():
                tally[key] = tally.get(key, 0) + 1
    if tally:
        L.append("\nTallies: " + ", ".join(f"{k} ×{v}" for k, v in tally.items()))
    if not (crit or d["noted"] or (g and (g["commits"] or g["status"]))):
        L.append("\nNothing tracked this session.")
    return "\n".join(L)


def render_sms(d):
    proj = os.path.basename(d["cwd"].rstrip("/")) or "session"
    crit = [a for a in d["critical"] if a["status"] == "ok"]
    failed = [a for a in d["critical"] if a["status"] != "ok"]
    parts = [f"[claude digest] {proj}"]
    if crit:
        parts.append("Outward/irreversible:")
        for a in crit[:6]:
            parts.append(f"• {a['label']}")
    if failed:
        parts.append(f"({len(failed)} attempted+failed)")
    g = d["git"]
    if g and g["commits"]:
        parts.append(f"{len(g['commits'])} commits")
    body = "\n".join(parts)
    return body[:600]


# --------------------------------------------------------------------------- #
# Notifications (stdlib)
# --------------------------------------------------------------------------- #
def send_email(subject, text):
    c = cfg()
    user, pw, to = c["GMAIL_ADDRESS"], c["GMAIL_APP_PASSWORD"], c["EMAIL_TO"]
    if not (user and pw and to):
        return False, "email: missing creds/recipient"
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = formataddr(("Claude Digest", user))
    msg["To"] = to
    msg.set_content(text)
    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx, timeout=30) as s:
            s.login(user, pw)
            s.send_message(msg)
        return True, f"email -> {to}"
    except Exception as e:  # noqa: BLE001
        return False, f"email FAILED: {e!r}"


def send_sms(body):
    c = cfg()
    sid, auth, frm, to = (c["TWILIO_ACCOUNT_SID"], c["TWILIO_AUTH_TOKEN"],
                          c["TWILIO_FROM"], c["SMS_TO"])
    if not (sid and auth and frm and to):
        return False, "sms: missing creds/recipient"
    url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    data = urllib.parse.urlencode({"To": to, "From": frm, "Body": body}).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Authorization", "Basic " + base64.b64encode(f"{sid}:{auth}".encode()).decode())
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            resp = json.loads(r.read().decode())
        return True, f"sms {resp.get('status')} -> {to}"
    except urllib.error.HTTPError as e:
        return False, f"sms HTTP {e.code}: {e.read().decode()[:150]}"
    except Exception as e:  # noqa: BLE001
        return False, f"sms FAILED: {e!r}"


def do_push(d, full):
    sms_ok, sms_msg = send_sms(render_sms(d))
    em_ok, em_msg = send_email(
        f"[claude digest] {os.path.basename(d['cwd'].rstrip('/'))}", full)
    return sms_ok, em_ok, f"{sms_msg} | {em_msg}"


# --------------------------------------------------------------------------- #
# Subcommand entrypoints
# --------------------------------------------------------------------------- #
def write_latest(full):
    try:
        with open(LATEST_MD, "w") as fh:
            fh.write(full + "\n")
        dated = os.path.join(SESS, f"{datetime.now().strftime('%Y%m%d-%H%M%S')}.md")
        with open(dated, "w") as fh:
            fh.write(full + "\n")
    except OSError:
        pass


def emit():
    sid = resolve_sid(sys.argv[2] if len(sys.argv) > 2 else None)
    d = build(sid)
    if not d:
        print("No session digest found yet. Actions are captured as you work.")
        return
    print(render_full(d))


def stop_hook():
    # Never block. Allow the stop, optionally hand a one-liner back to context.
    try:
        data = json.load(sys.stdin)
    except (ValueError, OSError):
        data = {}
    sid = resolve_sid(data.get("session_id"))
    d = build(sid)
    if not d:
        print(json.dumps({}))
        return
    full = render_full(d)
    write_latest(full)

    c = cfg()
    policy = c["PUSH"]
    cwd = d["cwd"]
    in_ralph = os.path.isfile(os.path.join(cwd, "RALPH.md"))
    new_crit = [a for a in d["critical"] if a["status"] == "ok" and not a.get("pushed")]
    note = None
    should = (policy == "all") or (policy == "critical" and new_crit)
    if should and policy != "off":
        ok_any = False
        if policy == "all" and not new_crit:
            sms_ok, em_ok, _ = do_push(d, full)
            ok_any = sms_ok or em_ok
        elif new_crit:
            sms_ok, em_ok, _ = do_push(d, full)
            ok_any = sms_ok or em_ok
        if ok_any:
            # mark pushed so Ralph loops don't re-send the same actions
            sess = load_session(sid)
            if sess:
                for a in sess["actions"]:
                    if a["level"] == "critical" and a["status"] == "ok":
                        a["pushed"] = True
                save_session(sid, sess)
            note = f"Session digest sent ({len(new_crit)} critical action(s))."
    out = {}
    if note and not in_ralph:
        out = {"hookSpecificOutput": {"hookEventName": "Stop", "additionalContext": note}}
    print(json.dumps(out))


def push():
    sid = resolve_sid(sys.argv[2] if len(sys.argv) > 2 else None)
    d = build(sid)
    if not d:
        print("No session digest to push.")
        return
    full = render_full(d)
    write_latest(full)
    sms_ok, em_ok, msg = do_push(d, full)
    print(full)
    print(f"\n[push] {msg}")


def test():
    sms_ok, sms_msg = send_sms("[claude digest] test, SMS channel works.")
    em_ok, em_msg = send_email("[claude digest] test", "Digest email channel works.")
    print(f"sms: {sms_msg}\nemail: {em_msg}")


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "emit"
    try:
        {"capture": capture, "stop-hook": stop_hook, "emit": emit,
         "push": push, "test": test}.get(cmd, emit)()
    except Exception as e:  # noqa: BLE001, a hook must never crash the harness
        if cmd in ("capture", "stop-hook"):
            print(json.dumps({}))
        else:
            print(f"[digest] error: {e!r}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
