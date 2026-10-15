// Simple axios helper for students.
// Usage:
//   const bands = await api('/bands');                          // GET
//   const band  = await api('/bands', { method: 'POST', body }); // POST
// Token is saved in localStorage after login and sent automatically.
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';

// 1. One shared axios instance for the whole app.
const client = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// 2. Before every request: attach the saved token (if logged in).
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 3. If the server says 401 (session expired): clear login, go to /login.
client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) window.location.href = '/login';
      return Promise.reject(new Error('Please login again'));
    }
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// 4. The only function pages use. Same call style as fetch, powered by axios.
export async function api(path, options = {}) {
  const { method = 'GET', body, headers } = options;
  const res = await client.request({ url: path, method, data: body, headers });
  return res.data;
}
