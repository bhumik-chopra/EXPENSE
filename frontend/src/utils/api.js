export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const USER_STORAGE_KEY = "expense-tracker-user";

function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getUserHeaders() {
  const user = getStoredUser();
  if (!user?.id) {
    return {};
  }

  return {
    "X-User-Id": String(user.id),
    "X-User-Email": String(user.email || ""),
    "X-User-Name": String(user.name || ""),
  };
}

export function persistCurrentUser(user) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify({
      id: user?.id || "",
      email: user?.email || "",
      name: user?.name || "",
    })
  );
}

export function clearCurrentUser() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(USER_STORAGE_KEY);
}

export async function apiFetch(path, options = {}) {
  const headers = { ...getUserHeaders(), ...(options.headers || {}) };

  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  return response;
}

export async function readJson(path, options = {}) {
  const response = await apiFetch(path, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return payload;
}

export async function processReceiptFile(file) {
  const formData = new FormData();
  formData.append(file.type === "application/pdf" ? "pdf" : "image", file);

  const payload = await readJson("/api/process-bill", {
    method: "POST",
    body: formData,
  });

  return payload;
}

export async function createExpense(expenseData) {
  return readJson("/api/expenses", {
    method: "POST",
    body: JSON.stringify(expenseData),
  });
}

export async function fetchExpenses(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.category && params.category !== "All Categories") {
    searchParams.set("category", params.category);
  }
  if (params.start_date) {
    searchParams.set("start_date", params.start_date);
  }
  if (params.end_date) {
    searchParams.set("end_date", params.end_date);
  }
  const queryString = searchParams.toString();
  const path = queryString ? `/api/expenses?${queryString}` : "/api/expenses";
  return readJson(path);
}

export async function deleteExpense(expenseId) {
  return readJson(`/api/expenses/${expenseId}`, {
    method: "DELETE",
  });
}

export async function fetchAnalytics() {
  return readJson("/api/analytics");
}
