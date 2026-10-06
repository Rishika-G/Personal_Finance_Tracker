import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Attach the JWT (issued at login/register) to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

export const transactionApi = {
  create: (data) => api.post("/transactions", data),
  list: (params) => api.get("/transactions", { params }),
  reviewQueue: () => api.get("/transactions/review-queue"),
  updateCategory: (id, data) => api.patch(`/transactions/${id}/category`, data),
  remove: (id) => api.delete(`/transactions/${id}`),
};

export const budgetApi = {
  upsert: (data) => api.post("/budgets", data),
  list: (params) => api.get("/budgets", { params }),
  remove: (id) => api.delete(`/budgets/${id}`),
};

export const insightApi = {
  byCategory: (params) => api.get("/insights/by-category", { params }),
  monthlyTrend: () => api.get("/insights/monthly-trend"),
};

export default api;
