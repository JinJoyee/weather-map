import { api } from './client';

export async function login(username, password) {
  const { data } = await api.post('/api/auth/login', { username, password });
  localStorage.setItem('token', data.access_token);
  return data;
}

export async function signup(username, password) {
  const { data } = await api.post('/api/auth/signup', { username, password });
  return data;
}

export function logout() {
  localStorage.removeItem('token');
}

export function getToken() {
  return localStorage.getItem('token');
}
