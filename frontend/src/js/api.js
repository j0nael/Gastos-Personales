
const API_URL =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.API_URL) ||
  "http://localhost:5000";

const TOKEN_KEY = "biengastao_token";
const USER_KEY = "biengastao_user";


// ---------------------------------------------------------------------------
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}


async function request(path, { method = "GET", body, auth = false, query } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new ApiError(401, "No has iniciado sesión");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Query string
  let url = `${API_URL}${path}`;
  if (query && typeof query === "object") {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const qsStr = qs.toString();
    if (qsStr) url += `?${qsStr}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError(0, "No se pudo conectar al servidor");
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_) {
      data = { message: text };
    }
  }

  if (!res.ok) {
    // Token inválido o expirado -> limpiar sesión para forzar re-login
    if (res.status === 401) {
      clearToken();
      clearStoredUser();
    }
    const message =
      (data && (data.message || data.error)) ||
      `Error ${res.status}`;
    throw new ApiError(res.status, message, data);
  }

  return data;
}


export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}


export function register({ name, email, password }) {
  return request("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}


export async function login({ email, password }) {
  const data = await request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (data && data.token) {
    setToken(data.token);
    if (data.user) setStoredUser(data.user);
  }
  return data;
}

export function logout() {
  clearToken();
  clearStoredUser();
}


export function getProfile() {
  return request("/auth/profile", { auth: true });
}


export function updateProfile({ name, email }) {
  return request("/auth/profile", {
    method: "PUT",
    body: { name, email },
    auth: true,
  });
}




export function getBalance() {
  return request("/users/balance", { auth: true });
}


export function getUserDetails() {
  return request("/users/details", { auth: true });
}


export function createTransaction({ amount, category, type }) {
  return request("/transactions", {
    method: "POST",
    body: { amount: Number(amount), category, type },
    auth: true,
  });
}

export function listTransactions({
  page = 1,
  limit = 10,
  startDate,
  endDate,
  category,
  type,
} = {}) {
  return request("/transactions", {
    auth: true,
    query: { page, limit, startDate, endDate, category, type },
  });
}


export function getTransaction(id) {
  return request(`/transactions/${id}`, { auth: true });
}


export function updateTransaction(id, { amount, category, type }) {
  return request(`/transactions/${id}`, {
    method: "PUT",
    body: { amount: Number(amount), category, type },
    auth: true,
  });
}


export function deleteTransaction(id) {
  return request(`/transactions/${id}`, {
    method: "DELETE",
    auth: true,
  });
}


export const CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "BILLS",
  "ENTERTAINMENT",
  "EDUCATION",
  "JOB",
];

export const TYPES = ["INCOME", "EXPENSE"];

export const CATEGORY_LABELS = {
  FOOD: "Comida",
  TRANSPORT: "Transporte",
  BILLS: "Facturas",
  ENTERTAINMENT: "Entretenimiento",
  EDUCATION: "Educación",
  JOB: "Trabajo",
};

export const TYPE_LABELS = {
  INCOME: "Ingreso",
  EXPENSE: "Gasto",
};


export const api = {
  // sesión
  getToken,
  setToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  isAuthenticated,
  logout,
  
  register,
  login,
  getProfile,
  updateProfile,
  
  getBalance,
  getUserDetails,
  
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  
  CATEGORIES,
  TYPES,
  CATEGORY_LABELS,
  TYPE_LABELS,
  ApiError,
};
