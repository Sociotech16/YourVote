import { api as mockApi } from './mock';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const isMock = import.meta.env.VITE_USE_MOCK === 'true';

async function http(method, path, body) {
  const token = localStorage.getItem('yv_token');
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// API contract the backend must implement (mirrors mock.js)
const real = {
  health: () => http('GET', '/health'),
  register: (p) => http('POST', '/api/auth/register', p),
  login: (p) => http('POST', '/api/auth/login', p),
  listElections: ({ search = '', status = '' } = {}) =>
    http('GET', `/api/elections?${new URLSearchParams({ search, status })}`),
  getElection: (id) => http('GET', `/api/elections/${id}`),
  castVotes: (id, selections) => http('POST', `/api/elections/${id}/votes`, { selections }),
  getResults: (id) => http('GET', `/api/elections/${id}/results`),
};

// /health is always real, so the UI shows the true state of the deployed backend
export const api = { ...(isMock ? mockApi : real), health: real.health };
