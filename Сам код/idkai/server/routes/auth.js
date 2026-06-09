import { Router } from 'express';
import crypto from 'crypto';
import {
  upsertAccount,
  createSession,
  getAccountByToken,
  deleteSession,
  setTier,
  updateProfile,
} from '../db.js';

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com']; // кто мог выпустить токен

// публичные ключи гугла меняются редко, поэтому кешируем на час
let cachedKeys = null;
let cachedAt = 0;
async function getGoogleKeys() {
  if (cachedKeys && Date.now() - cachedAt < 3600_000) return cachedKeys; // кеш ещё свежий
  const res = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  if (!res.ok) throw new Error('failed to fetch google certs');
  const { keys } = await res.json();
  cachedKeys = keys;
  cachedAt = Date.now();
  return keys;
}

// сами проверяем подпись JWT от гугла, без лишних либ
async function verifyGoogleToken(idToken) {
  // JWT это три части через точку: заголовок.payload.подпись
  const [h, p, s] = String(idToken).split('.');
  if (!h || !p || !s) throw new Error('malformed token');
  const header = JSON.parse(Buffer.from(h, 'base64url').toString());
  const payload = JSON.parse(Buffer.from(p, 'base64url').toString());

  // по kid из заголовка находим нужный ключ среди гугловских
  const key = (await getGoogleKeys()).find((k) => k.kid === header.kid);
  if (!key) throw new Error('no matching signing key');
  const pubKey = crypto.createPublicKey({ key, format: 'jwk' });
  // проверяем, что подпись реально гугловская
  const ok = crypto.verify('RSA-SHA256', Buffer.from(`${h}.${p}`), pubKey, Buffer.from(s, 'base64url'));
  if (!ok) throw new Error('bad signature');

  // токен наш, только если выпустил гугл и предназначен именно нашему приложению
  if (!GOOGLE_ISSUERS.includes(payload.iss)) throw new Error('bad issuer');
  if (payload.aud !== GOOGLE_CLIENT_ID) throw new Error('bad audience');
  return payload;
}

// достаём токен из заголовка Authorization: Bearer xxx
function getToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

// мидлвара: пускаем дальше только с валидным токеном
function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  const result = getAccountByToken(token);
  if (!result) return res.status(401).json({ error: 'unauthorized' });
  req.auth = result; // кладём аккаунт в req, чтобы хендлеры не дёргали базу заново
  next();
}

// вход через гугл: фронт присылает credential, мы его проверяем и заводим сессию
router.post('/auth/google', async (req, res) => {
  // без настроенного client id логин в принципе невозможен
  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: 'google_not_configured' });
  }
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'credential_required' });

  try {
    const payload = await verifyGoogleToken(credential);
    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    // токен валиден — заводим/обновляем аккаунт по данным из него
    const account = upsertAccount({
      sub: payload.sub,
      email: payload.email || '',
      name: payload.name || '',
      avatar: payload.picture || null,
    });

    // отдаём свежий токен сессии вместе с данными аккаунта
    const token = createSession(payload.sub);
    return res.json({ token, ...account });
  } catch (err) {
    console.error('[auth/google] verify failed:', err?.message || err);
    return res.status(401).json({ error: 'invalid_token' });
  }
});

// кто я — отдаём профиль текущего юзера
router.get('/me', requireAuth, (req, res) => {
  return res.json(req.auth.account);
});

// выход — гасим сессию
router.post('/logout', requireAuth, (req, res) => {
  deleteSession(getToken(req));
  return res.json({ success: true });
});

// покупка тарифа (free тут нельзя — его не покупают)
router.post('/purchase', requireAuth, (req, res) => {
  const { tier } = req.body;
  if (tier !== 'standard' && tier !== 'pro') {
    return res.status(400).json({ error: 'invalid_tier' });
  }
  const result = setTier(req.auth.sub, tier);
  if (!result.success) return res.status(400).json({ error: result.error });
  return res.json(result.account);
});

// правка профиля (ник, аватарка)
router.put('/me/profile', requireAuth, (req, res) => {
  const { nickname, avatar } = req.body;
  const account = updateProfile(req.auth.sub, { nickname, avatar });
  if (!account) return res.status(404).json({ error: 'not_found' });
  return res.json(account);
});

export default router;
