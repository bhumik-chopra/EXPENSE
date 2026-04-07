export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };

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

export async function processReceiptFile(file) {
  const formData = new FormData();
  formData.append(file.type === "application/pdf" ? "pdf" : "image", file);

  const response = await apiFetch("/api/process-bill", {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return payload;
}

export async function createExpense(expenseData) {
  const response = await apiFetch("/api/expenses", {
    method: "POST",
    body: JSON.stringify(expenseData),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return payload;
}
