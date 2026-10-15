const TOKEN_KEY = "accessToken";

/**
 * Error yang dilempar ketika respons API berstatus "fail" atau "error".
 * `data` berisi detail validasi (mis. { field: ["Pesan"] }) bila tersedia.
 */
export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Menyusun URL lengkap dari path dan query string, melewati nilai kosong. */
export function buildUrl(path, query = {}) {
  const url = new URL(`${DELCOM_BASEURL}${path}`);
  Object.entries(query)
    .filter(([, value]) => value != null)
    .forEach(([key, value]) => url.searchParams.set(key, String(value)));
  return url.toString();
}

/**
 * Mengubah path aset relatif dari API (mis. "img/cover/1.png")
 * menjadi URL absolut berdasarkan origin server API.
 */
export function getAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${new URL(DELCOM_BASEURL).origin}/${path.replace(/^\/+/, "")}`;
}

/**
 * Pembungkus fetch untuk Delcom Open API.
 * Mengirim header Authorization: Bearer <token> bila tersedia.
 */
export async function apiFetch(path, { method = "GET", body, formData, query, auth = true } = {}) {
  const headers = { Accept: "application/json" };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let payload;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: payload,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.status !== "success") {
    throw new ApiError(json.message || response.statusText || "Terjadi kesalahan", {
      status: response.status,
      data: json.data,
    });
  }

  return json;
}
