const BASE_URL = "https://bd-shop-gfva.onrender.com/api";

const getFullUrl = (path) => {
  const cleanBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  let cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (cleanPath.startsWith("/api/")) {
    cleanPath = cleanPath.replace("/api", "");
  }

  return `${cleanBase}${cleanPath}`;
};

const getHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("access_token");
  const headers = {
    Accept: "application/json",
    ...extraHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

async function handle(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("API Error Response:", data);
    if (res.status === 401) {
      // localStorage.removeItem("access_token");
    }
    const msg = data?.message || `API klaida: ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export async function apiGet(path, { signal } = {}) {
  const url = getFullUrl(path);
  console.log("Siunčiama užklausa į:", url);

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: getHeaders(),
    signal,
  });
  return handle(res);
}

export async function apiPost(path, body, { signal } = {}) {
  const url = getFullUrl(path);

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(body ?? {}),
    signal,
  });
  return handle(res);
}

export async function apiPut(path, body, { signal } = {}) {
  const url = getFullUrl(path);
  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body ?? {}),
    signal,
  });
  return handle(res);
}

export async function apiDelete(path, { signal } = {}) {
  const url = getFullUrl(path);
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: getHeaders(),
    signal,
  });
  return handle(res);
}
