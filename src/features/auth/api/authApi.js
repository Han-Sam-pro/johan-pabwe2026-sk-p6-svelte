import { apiFetch } from "../../../helpers/apiHelper.js";

export async function register({ name, email, password }) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: { name, email, password },
    auth: false,
  });
}

/** Mengembalikan { user, token } dari respons login. */
export async function login(email, password) {
  const json = await apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  return json.data;
}

export async function logout() {
  return apiFetch("/auth/logout", { method: "POST" });
}
