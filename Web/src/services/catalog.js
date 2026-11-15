const CART_KEY = 'choco-delight-cart-v1';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api';
const TOKEN_KEY = 'choco-delight-token-v1';

function tokenPayload(token) {
  try {
    const encoded = token.split('.')[1];
    if (!encoded) return null;
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
  } catch {
    return null;
  }
}

function isExpired(token) {
  const payload = tokenPayload(token);
  return !payload || (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now() + 30_000);
}

export function isAuthTokenExpired(token) {
  return isExpired(token);
}

export async function fetchCatalog() {
  const response = await fetch(`${API_BASE}/catalog`);
  if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
  return response.json();
}

export async function fetchProduct(slug) {
  const response = await fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`);
  if (!response.ok) throw new Error(`Product request failed: ${response.status}`);
  return response.json();
}

export async function fetchMakers() {
  const response = await fetch(`${API_BASE}/makers`);
  if (!response.ok) throw new Error(`Makers request failed: ${response.status}`);
  return response.json();
}

export async function fetchMaker(slug) {
  const response = await fetch(`${API_BASE}/makers/${encodeURIComponent(slug)}`);
  if (!response.ok) throw new Error(`Maker request failed: ${response.status}`);
  return response.json();
}

async function authRequest(path, payload) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Authentication request failed: ${response.status}`);
  return data;
}

export function loginUser(email, password) {
  return authRequest('/auth/login', { email, password });
}

export function registerUser(name, email, password) {
  return authRequest('/auth/register', { name, email, password });
}

export async function fetchOrders(token) {
  if (isExpired(token)) { clearAuthSession(); const error = new Error('Invalid or expired token'); error.status = 401; throw error; }
  const response = await fetch(`${API_BASE}/orders`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || `Orders request failed: ${response.status}`); error.status = response.status; if (response.status === 401) clearAuthSession(); throw error; }
  return data;
}

export async function fetchPreferences(token) {
  if (isExpired(token)) { clearAuthSession(); const error = new Error('Invalid or expired token'); error.status = 401; throw error; }
  const response = await fetch(`${API_BASE}/me/preferences`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || `Preferences request failed: ${response.status}`); error.status = response.status; if (response.status === 401) clearAuthSession(); throw error; }
  return data;
}

export async function updatePreferences(token, preferences) {
  if (isExpired(token)) { clearAuthSession(); const error = new Error('Invalid or expired token'); error.status = 401; throw error; }
  const response = await fetch(`${API_BASE}/me/preferences`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(preferences) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || `Preferences update failed: ${response.status}`); error.status = response.status; if (response.status === 401) clearAuthSession(); throw error; }
  return data;
}

export async function fetchAddresses(token) {
  if (isExpired(token)) { clearAuthSession(); const error = new Error('Invalid or expired token'); error.status = 401; throw error; }
  const response = await fetch(`${API_BASE}/me/addresses`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || `Addresses request failed: ${response.status}`); error.status = response.status; if (response.status === 401) clearAuthSession(); throw error; }
  return data;
}

export async function saveAddress(token, label, address) {
  if (isExpired(token)) { clearAuthSession(); const error = new Error('Invalid or expired token'); error.status = 401; throw error; }
  const response = await fetch(`${API_BASE}/me/addresses/${encodeURIComponent(label)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(address) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || `Address update failed: ${response.status}`); error.status = response.status; if (response.status === 401) clearAuthSession(); throw error; }
  return data;
}

export async function fetchLoyalty(token) {
  if (isExpired(token)) { clearAuthSession(); const error = new Error('Invalid or expired token'); error.status = 401; throw error; }
  const response = await fetch(`${API_BASE}/me/loyalty`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || `Loyalty request failed: ${response.status}`); error.status = response.status; if (response.status === 401) clearAuthSession(); throw error; }
  return data;
}

export async function fetchAdminDashboard(token) {
  if (isExpired(token)) { clearAuthSession(); const error = new Error('Invalid or expired token'); error.status = 401; throw error; }
  const response = await fetch(`${API_BASE}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || `Admin dashboard request failed: ${response.status}`); error.status = response.status; if (response.status === 401) clearAuthSession(); throw error; }
  return data;
}

export async function fetchAdminOrders(token) {
  if (isExpired(token)) { clearAuthSession(); const error = new Error('Invalid or expired token'); error.status = 401; throw error; }
  const response = await fetch(`${API_BASE}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || `Admin orders request failed: ${response.status}`); error.status = response.status; if (response.status === 401) clearAuthSession(); throw error; }
  return data;
}

export async function updateAdminOrderStatus(token, orderId, status) {
  if (isExpired(token)) { clearAuthSession(); const error = new Error('Invalid or expired token'); error.status = 401; throw error; }
  const response = await fetch(`${API_BASE}/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || `Admin order update failed: ${response.status}`); error.status = response.status; if (response.status === 401) clearAuthSession(); throw error; }
  return data;
}

export async function createOrder(token, address, items) {
  if (token && isExpired(token)) { clearAuthSession(); const error = new Error('Invalid or expired token'); error.status = 401; throw error; }
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ address, items }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || `Order request failed: ${response.status}`); error.status = response.status; if (response.status === 401) clearAuthSession(); throw error; }
  return data;
}

const GUEST_ORDER_KEY = 'choco-delight-guest-order-v1';

export function saveGuestOrder(order) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(GUEST_ORDER_KEY, JSON.stringify(order));
}

export function loadGuestOrder() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(window.sessionStorage.getItem(GUEST_ORDER_KEY) || 'null'); } catch { return null; }
}

export function saveAuthSession(data) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(TOKEN_KEY, data.token);
  window.sessionStorage.setItem(`${TOKEN_KEY}-user`, JSON.stringify(data.user));
}

export function loadAuthSession() {
  if (typeof window === 'undefined') return null;
  const token = window.sessionStorage.getItem(TOKEN_KEY);
  const rawUser = window.sessionStorage.getItem(`${TOKEN_KEY}-user`);
  if (!token || !rawUser) return null;
  if (isExpired(token)) { clearAuthSession(); return null; }
  try { return { token, user: JSON.parse(rawUser) }; } catch { return null; }
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(`${TOKEN_KEY}-user`);
}

export function loadCartCount() {
  if (typeof window === 'undefined') return 0;
  const stored = Number(window.localStorage.getItem(CART_KEY));
  return Number.isFinite(stored) && stored >= 0 ? stored : 0;
}

export function saveCartCount(count) {
  if (typeof window !== 'undefined') window.localStorage.setItem(CART_KEY, String(count));
}

export function loadCartItems() {
  if (typeof window === 'undefined') return [];
  try {
    const items = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
    if (typeof items === 'number' && items > 0) return [{ productId: 'dark-70', quantity: items }];
    return Array.isArray(items) ? items : [];
  } catch { return []; }
}

export function saveCartItems(items) {
  if (typeof window !== 'undefined') window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}
