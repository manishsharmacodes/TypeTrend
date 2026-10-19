/**
 * TypeTrend API Client Service
 * Centralizes REST API calls to the Flask backend.
 */

// Use VITE_API_BASE if provided (e.g., https://your-backend.onrender.com), otherwise fallback to local proxy /api
const customBase = import.meta.env.VITE_API_BASE ? import.meta.env.VITE_API_BASE.replace(/\/+$/, '') : '';
const API_BASE = customBase ? `${customBase}/api` : '/api';


async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.error || errorData.message || `HTTP error ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  // Health
  async getHealth() {
    return handleResponse(await fetch(`${API_BASE}/health`));
  },

  // Dashboard Aggregates
  async getDashboard(includeDemo = false) {
    return handleResponse(await fetch(`${API_BASE}/dashboard?include_demo=${includeDemo}`));
  },

  // Sessions
  async getSessions({ category = 'all', limit = 100, includeDemo = false } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (limit) params.append('limit', limit);
    params.append('include_demo', includeDemo);
    return handleResponse(await fetch(`${API_BASE}/sessions?${params.toString()}`));
  },

  async saveSession(sessionData) {
    return handleResponse(
      await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      })
    );
  },

  // Machine Learning Prediction
  async getPrediction(includeDemo = false) {
    return handleResponse(await fetch(`${API_BASE}/prediction?include_demo=${includeDemo}`));
  },

  // Goals
  async getGoals() {
    return handleResponse(await fetch(`${API_BASE}/goals`));
  },

  async updateGoals(goalsData) {
    return handleResponse(
      await fetch(`${API_BASE}/goals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalsData),
      })
    );
  },

  // Passages
  async getPassages(category = 'general') {
    return handleResponse(await fetch(`${API_BASE}/passages?category=${category}`));
  },

  // Demo & Reset Data
  async seedDemoData() {
    return handleResponse(
      await fetch(`${API_BASE}/demo-data`, {
        method: 'POST',
      })
    );
  },

  async clearData(onlyDemo = false) {
    return handleResponse(
      await fetch(`${API_BASE}/clear-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ only_demo: onlyDemo }),
      })
    );
  },
};
