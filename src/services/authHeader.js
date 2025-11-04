import { getAccessToken } from './tokenService';

export function getAuthHeader() {
  const token = getAccessToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}