// общие заголовки для запросов от имени залогиненного юзера
function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// меняем гугловский credential на нашу сессию
export async function apiGoogleLogin(credential) {
  const resp = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.error || 'login_failed');
  }
  return resp.json();
}

// тянем профиль по токену; если что-то не так — просто null, без падений
export async function apiFetchMe(token) {
  try {
    const resp = await fetch('/api/me', { headers: authHeaders(token) });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export async function apiLogout(token) {
  try {
    await fetch('/api/logout', { method: 'POST', headers: authHeaders(token) });
  } catch {
    // даже если сервер не ответил — на фронте всё равно разлогиниваем
  }
}

// покупка тарифа
export async function apiPurchase(token, tier) {
  const resp = await fetch('/api/purchase', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ tier }),
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.error || 'purchase_failed');
  }
  return resp.json();
}

// сохраняем ник/аватарку
export async function apiUpdateProfile(token, data) {
  const resp = await fetch('/api/me/profile', {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error('update_failed');
  return resp.json();
}

// по ссылке на видео получаем инфу о нём (превью, автор, прямая ссылка)
export async function apiResolveDownload(url) {
  const resp = await fetch('/api/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || 'download_failed');
  return data;
}

// собираем ссылку на наш прокси-эндпоинт, который отдаёт файл как вложение
export function downloadFileUrl(url, filename) {
  const params = new URLSearchParams({ url });
  if (filename) params.set('filename', filename);
  return `/api/download/file?${params.toString()}`;
}

// узнаём, включён ли вообще ИИ на сервере (есть ли ключ)
export async function apiAiStatus() {
  try {
    const resp = await fetch('/api/ai/status');
    if (!resp.ok) return { enabled: false };
    return await resp.json();
  } catch {
    return { enabled: false };
  }
}

// генерим текстовый промт через Gemini
export async function apiGeneratePrompt(systemPrompt, userMessage) {
  const resp = await fetch('/api/ai/prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userMessage }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || 'generation_failed');
  return data.text;
}

// генерим картинку по тексту, в ответ прилетает base64
export async function apiGenerateImage(prompt) {
  const resp = await fetch('/api/ai/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || 'generation_failed');
  return data;
}
