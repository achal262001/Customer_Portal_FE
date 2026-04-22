import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap response data; broadcast errors; propagate to callers
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const payload = err?.response?.data ?? err;
    const message =
      (typeof payload === "string" ? payload : null) ||
      payload?.message ||
      err?.message ||
      "An unexpected error occurred.";
    window.dispatchEvent(new CustomEvent("api-error", { detail: message }));
    return Promise.reject(payload);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const login = (email, password) =>{
  return api.post("/auth/login", { email, password });
}

export const register = (payload) =>
  api.post("/auth/register", payload);

export const logout = () => api.post("/auth/logout");

// ── Tickets ───────────────────────────────────────────────
export const getAllTickets = (filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v != null && v !== "")
  );
  return api.get("/tickets", { params });
};

export const getTicketById = (id) => api.get(`/tickets/${id}`);

export const createTicket = (data) => api.post("/tickets", data);

export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data);

export const deleteTicket = (id) => api.delete(`/tickets/${id}`);

// ── Clients ───────────────────────────────────────────────
export const getAllClients = () => api.get("/clients");

export const getActiveClients = () => api.get("/clients/active");

export const getClientById = (id) => api.get(`/clients/${id}`);

export const createClient = (data) => api.post("/clients", data);

export const updateClient = (id, data) => api.put(`/clients/${id}`, data);

export const deleteClient = (id) => api.delete(`/clients/${id}`);

// ── Users ─────────────────────────────────────────────────
export const getAllUsers = () => api.get("/users");

export const getUserById = (id) => api.get(`/users/${id}`);

export const getUsersByRole = (roleId) => api.get(`/users/by-role/${roleId}`);

export const createUser = (data) => api.post("/users", data);

export const updateUser = (id, data) => api.put(`/users/${id}`, data);

export const deleteUser = (id) => api.delete(`/users/${id}`);

// ── Categories ────────────────────────────────────────────
export const getAllCategories = () => api.get("/categories");

export const createCategory = (data) => api.post("/categories", data);

export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);

export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ── Projects ──────────────────────────────────────────────
export const getAllProjects = () => api.get("/projects");

export const getProjectsByClient = (clientId) =>
  api.get(`/projects/by-client/${clientId}`);

export const createProject = (data) => api.post("/projects", data);

export const updateProject = (id, data) => api.put(`/projects/${id}`, data);

// ── Ticket Statuses ───────────────────────────────────────
export const getAllTicketStatuses = () => api.get("/ticket-statuses");

// ── Severities ────────────────────────────────────────────
export const getAllSeverities = () => api.get("/severities");

// ── Escalations ───────────────────────────────────────────
export const getEscalationsByTicket = (ticketId) =>
  api.get(`/escalations/by-ticket/${ticketId}`);

export const createEscalation = (data) => api.post("/escalations", data);

// ── Ticket Assignments ────────────────────────────────────
export const getAssignmentsByTicket = (ticketId) =>
  api.get(`/ticket-assignments/by-ticket/${ticketId}`);

export const createAssignment = (data) => api.post("/ticket-assignments", data);

// ── Dashboard ─────────────────────────────────────────────
export const getDashboardSummary = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== "")
  );
  return api.get("/dashboard/summary", { params: clean });
};

export const getDashboardStats = () => api.get("/dashboard/stats");

export const getRecentActivities = () => api.get("/dashboard/recent-activities");

export const getTicketsByClient = (params = {}) =>
  api.get("/dashboard/charts/tickets-by-client", { params });

export const getTicketsByModule = (params = {}) =>
  api.get("/dashboard/charts/tickets-by-module", { params });

export const getTicketActivity = (params = {}) =>
  api.get("/dashboard/charts/ticket-activity", { params });

export const getTicketsByCategory = (params = {}) =>
  api.get("/dashboard/charts/tickets-by-category", { params });

// ── Communication ─────────────────────────────────────────
export const getCommunicationTickets = (params = {}) =>
  api.get("/communication/tickets", { params });

export const getTicketMessages = (ticketId) =>
  api.get(`/communication/tickets/${ticketId}/messages`);

export const sendTicketMessage = (ticketId, data) =>
  api.post(`/communication/tickets/${ticketId}/messages`, data);

export const getNotifications = () => api.get("/communication/notifications");

export default api;
