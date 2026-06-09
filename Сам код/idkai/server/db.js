import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data', 'idkai.db'); // сам файл базы
const dataDir = path.join(__dirname, 'data');

const VALID_TIERS = ['free', 'standard', 'pro']; // допустимые тарифы, всё остальное игнорим

let db; // sql.js работает в памяти, на диск скидываем руками

export async function initDb() {
  // папки data может ещё не быть — создаём
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    // база уже есть — грузим её содержимое в память
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    // первый запуск — заводим пустую
    db = new SQL.Database();
  }

  // таблица аккаунтов — заводим один раз
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      google_sub TEXT PRIMARY KEY,
      email TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL DEFAULT '',
      avatar TEXT,
      tier TEXT NOT NULL DEFAULT 'free',
      nickname TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL DEFAULT 0
    )
  `);

  // токены живых сессий
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      google_sub TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT 0
    )
  `);

  saveDb();
}

// скидываем всю базу из памяти в файл (зовём после каждой записи)
function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// приводим сырую строку из базы к удобному объекту аккаунта
function rowToAccount(row) {
  return {
    email: row.email || '',
    name: row.name || '',
    avatar: row.avatar || null,
    tier: VALID_TIERS.includes(row.tier) ? row.tier : 'free', // если в базе мусор — считаем free
    nickname: row.nickname || '',
  };
}

// ищем аккаунт по гугловскому идентификатору (sub)
export function getAccountBySub(sub) {
  const stmt = db.prepare('SELECT * FROM accounts WHERE google_sub = ?');
  stmt.bind([sub]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return rowToAccount(row);
  }
  stmt.free();
  return null;
}

// есть аккаунт — обновляем, нет — создаём (классический upsert)
export function upsertAccount({ sub, email, name, avatar }) {
  const existing = getAccountBySub(sub);
  const now = Date.now();
  if (existing) {
    // на повторном входе освежаем данные из гугла, тариф и ник не трогаем
    db.run(
      'UPDATE accounts SET email = ?, name = ?, avatar = ?, updated_at = ? WHERE google_sub = ?',
      [email || '', name || '', avatar || null, now, sub]
    );
  } else {
    // новичок — заводим на free, ник по умолчанию = имя из гугла
    db.run(
      `INSERT INTO accounts (google_sub, email, name, avatar, tier, nickname, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'free', ?, ?, ?)`,
      [sub, email || '', name || '', avatar || null, name || '', now, now]
    );
  }
  saveDb();
  return getAccountBySub(sub);
}

// меняем тариф (вызывается после оплаты)
export function setTier(sub, tier) {
  if (!VALID_TIERS.includes(tier)) return { success: false, error: 'invalid_tier' };
  db.run('UPDATE accounts SET tier = ?, updated_at = ? WHERE google_sub = ?', [tier, Date.now(), sub]);
  saveDb();
  return { success: true, account: getAccountBySub(sub) };
}

// обновляем ник/аватарку; что не передали — оставляем как было
export function updateProfile(sub, { nickname, avatar }) {
  const existing = getAccountBySub(sub);
  if (!existing) return null;
  db.run(
    'UPDATE accounts SET nickname = ?, avatar = ?, updated_at = ? WHERE google_sub = ?',
    [
      nickname != null ? nickname : existing.nickname,
      avatar !== undefined ? avatar : existing.avatar,
      Date.now(),
      sub,
    ]
  );
  saveDb();
  return getAccountBySub(sub);
}

// создаём сессию — токен это просто случайные 32 байта в hex
export function createSession(sub) {
  const token = crypto.randomBytes(32).toString('hex');
  db.run('INSERT INTO sessions (token, google_sub, created_at) VALUES (?, ?, ?)', [token, sub, Date.now()]);
  saveDb();
  return token;
}

// по токену достаём, чей это аккаунт
export function getSubByToken(token) {
  const stmt = db.prepare('SELECT google_sub FROM sessions WHERE token = ?');
  stmt.bind([token]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row.google_sub;
  }
  stmt.free();
  return null;
}

// удобный шорткат: по токену сразу и sub, и сам аккаунт
export function getAccountByToken(token) {
  const sub = getSubByToken(token);
  if (!sub) return null;
  const account = getAccountBySub(sub);
  if (!account) return null;
  return { sub, account };
}

// разлогин — просто выкидываем токен из таблицы сессий
export function deleteSession(token) {
  db.run('DELETE FROM sessions WHERE token = ?', [token]);
  saveDb();
}
