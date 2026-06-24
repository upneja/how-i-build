// Twilio inbound-webhook helpers: signature validation + TwiML response.
import crypto from "node:crypto";

/**
 * Validate the X-Twilio-Signature header per Twilio's algorithm:
 * HMAC-SHA1( authToken, fullUrl + each sorted POST param key+value ), base64.
 * Fails closed (returns false) if anything is missing.
 */
export function validateTwilioSignature(authToken, url, params, signature) {
  if (!authToken || !signature) return false;
  const data = Object.keys(params)
    .sort()
    .reduce((acc, k) => acc + k + params[k], url);
  const expected = crypto
    .createHmac("sha1", authToken)
    .update(Buffer.from(data, "utf-8"))
    .digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Build a TwiML response. Pass a falsy message for an empty (no-reply) response. */
export function twiml(message) {
  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${esc(message)}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
}
