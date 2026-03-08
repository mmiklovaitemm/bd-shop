export const API_ORIGIN =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

async function handle(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || `API error ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export async function apiGet(path, { signal } = {}) {
  const res = await fetch(`${API_ORIGIN}${path}`, {
    method: "GET",
    credentials: "include",
    signal,
  });
  return handle(res);
}

export async function apiPost(path, body, { signal } = {}) {
  const res = await fetch(`${API_ORIGIN}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    signal,
  });
  return handle(res);
}
