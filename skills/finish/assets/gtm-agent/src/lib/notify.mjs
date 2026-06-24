// Outbound SMS via the Twilio REST API. Fetch-based, no SDK, no dependencies.

/** Normalize a phone number to E.164 (assumes US if 10/11 digits). */
export function e164(raw) {
  const d = String(raw).replace(/[^\d+]/g, "");
  if (d.startsWith("+")) return d;
  if (d.length === 10) return "+1" + d;
  if (d.length === 11 && d.startsWith("1")) return "+" + d;
  return d;
}

/** Flatten a user-controlled string before it hits an SMS body. */
export function clean(s, max = 1200) {
  return String(s)
    .replace(/[\r\n]+/g, " ")
    .replace(/[<>`*_|]/g, "")
    .trim()
    .slice(0, max);
}

/** Send one SMS. Returns true on success, false (fail-silent) otherwise. */
export async function sendSms(to, body, cfg = process.env) {
  const sid = cfg.TWILIO_ACCOUNT_SID;
  const auth = cfg.TWILIO_AUTH_TOKEN;
  const from = cfg.TWILIO_FROM;
  if (!sid || !auth || !from) {
    console.warn("[notify] Twilio not configured; SMS suppressed");
    return false;
  }
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${auth}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: e164(to), From: from, Body: clean(body) }),
      },
    );
    if (!res.ok) {
      console.error("[notify] Twilio error", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[notify] Twilio send failed", err);
    return false;
  }
}
