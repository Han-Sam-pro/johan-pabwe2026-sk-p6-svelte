import { render } from "@testing-library/svelte";
import { authStore } from "./features/auth/states/authStore.js";
import { putAccessToken, removeAccessToken } from "./helpers/apiHelper.js";
import { navigate } from "./navigation.js";

/**
 * Merender komponen beserta konteks yang dibutuhkan aplikasi:
 * - token autentikasi (localStorage + authStore)
 * - rute awal pada router kustom
 */
export function renderWithProviders(Component, { props = {}, token = null, route = null } = {}) {
  if (token) {
    putAccessToken(token);
    authStore.set({ token, user: null });
  } else {
    removeAccessToken();
    authStore.set({ token: null, user: null });
  }

  if (route) {
    navigate(route);
  }

  return render(Component, { props });
}
