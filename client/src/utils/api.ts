const API_BASE_URL = '/api';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: { username: string; email: string; password: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  // Game
  getGameState: () => apiRequest('/game/state'),

  // Buildings
  buildBuilding: (data: { buildingType: string; gridX: number; gridY: number }) =>
    apiRequest('/buildings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBuildings: () => apiRequest('/buildings'),

  // Units
  trainUnit: (data: { unitType: string; buildingId: number }) =>
    apiRequest('/units', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUnits: () => apiRequest('/units'),
};
