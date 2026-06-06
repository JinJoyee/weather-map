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

export async function checkUsernameAvailable(username) {
  const { data } = await api.get(`/api/auth/username-available?username=${encodeURIComponent(username)}`);
  return data.available;
}

export async function resetPassword(username, newPassword) {
  const { data } = await api.post('/api/auth/password/reset', { username, new_password: newPassword });
  return data;
}
