import { derived, writable } from "svelte/store";
import { getAccessToken, putAccessToken, removeAccessToken } from "../../../helpers/apiHelper.js";
import * as authApi from "../api/authApi.js";

export const authStore = writable({
  token: getAccessToken(),
  user: null,
});

export const isAuthenticated = derived(authStore, ($auth) => Boolean($auth.token));

export async function login(email, password) {
  const { user, token } = await authApi.login(email, password);

  putAccessToken(token);
  authStore.set({ token, user });

  return user;
}

export async function register(payload) {
  return authApi.register(payload);
}

/** Selalu membersihkan sesi lokal, meskipun permintaan logout ke server gagal. */
export async function logout() {
  try {
    await authApi.logout();
  } finally {
    removeAccessToken();
    authStore.set({ token: null, user: null });
  }
}
