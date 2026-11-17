// La Plata passcode reset: emails a 6-digit code to Vanessa's own address only.
// No database: the code is checked with a signed token that expires in 15 minutes.
// Needs RESEND_API_KEY in the Vercel project; until then it answers 503 not_ready.
const crypto = require('crypto');

const TO = 'destanyvz@gmail.com';
const FROM = process.env.RESET_FROM || 'La Plata <reset@abramsdesign.studio>';
const TTL = 15 * 60 * 1000;
const hits = new Map();

function limited(key, max) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter(t => now - t < 60 * 60 * 1000);
  if (list.length >= max) return true;
  list.push(now);
  hits.set(key, list);
  return false;
}

const sign = (secret, code, exp) =>
  crypto.createHmac('sha256', secret + '|destany-reset').update(code + '.' + exp).digest('hex');

const okOrigin = o => !o || /^https:\/\/((www\.)?abramsdesign\.studio|[a-z0-9-]+\.vercel\.app)$/.test(o);

function emailHtml(code) {
  return `<!doctype html><html><body style="margin:0;background:#FFF4F8;font-family:Georgia,'Times New Roman',serif;color:#4A0E2E">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF4F8;padding:40px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#D81B78;border-radius:12px;color:#FFF9F6;text-align:center">
<tr><td style="padding:40px 28px 12px;font-size:32px;font-style:italic">Hola, Vanessa.</td></tr>
<tr><td style="padding:0 28px 22px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5">Here’s your code to set a new passcode.</td></tr>
<tr><td style="padding:0 28px"><div style="display:inline-block;background:#FFF9F6;color:#D81B78;border-radius:12px;padding:16px 26px;font-family:Helvetica,Arial,sans-serif;font-size:34px;font-weight:700;letter-spacing:8px">${code}</div></td></tr>
<tr><td style="padding:22px 28px 40px;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5">It works for 15 minutes. Your numbers stay just as they are.<br>Didn’t ask for this? You can ignore it.</td></tr>
</table></td></tr></table></body></html>`;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (!okOrigin(req.headers.origin || '')) return res.status(403).json({ ok: false });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ ok: false, why: 'not_ready' });

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';

  if (b.a === 'send') {
    if (limited('send', 12) || limited('send:' + ip, 5)) return res.status(429).json({ ok: false, why: 'slow' });
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const exp = Date.now() + TTL;
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM,
          to: [TO],
          subject: 'Your La Plata code: ' + code,
          html: emailHtml(code),
          text: `Hola, Vanessa. Your code to set a new passcode is ${code}. It works for 15 minutes. Your numbers stay just as they are. Didn't ask for this? You can ignore it.`
        })
      });
      if (!r.ok) return res.status(502).json({ ok: false, why: 'send' });
    } catch (e) {
      return res.status(502).json({ ok: false, why: 'send' });
    }
    return res.status(200).json({ ok: true, token: sign(key, code, exp), exp });
  }

  if (b.a === 'verify') {
    if (limited('verify:' + ip, 20)) return res.status(429).json({ ok: false, why: 'slow' });
    const { code, token, exp } = b;
    if (!/^\d{6}$/.test(String(code)) || typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token) || !Number.isFinite(exp))
      return res.status(400).json({ ok: false });
    if (Date.now() > exp || exp - Date.now() > TTL) return res.status(410).json({ ok: false, why: 'expired' });
    const good = sign(key, String(code), exp);
    const ok = crypto.timingSafeEqual(Buffer.from(token), Buffer.from(good));
    return res.status(ok ? 200 : 401).json({ ok });
  }

  return res.status(400).json({ ok: false });
};
