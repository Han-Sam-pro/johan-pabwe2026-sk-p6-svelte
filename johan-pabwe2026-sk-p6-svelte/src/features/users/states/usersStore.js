import { writable } from "svelte/store";
import { authStore } from "../../auth/states/authStore.js";
import * as usersApi from "../api/usersApi.js";

export const users = writable([]);

export async function loadUsers() {
  users.set(await usersApi.getUsers());
}

/** Mengambil profil terbaru dan menyimpannya ke authStore. */
export async function refreshProfile() {
  const user = await usersApi.getMe();
  authStore.update((state) => ({ ...state, user }));
  return user;
}

export async function updateProfile(payload) {
  await usersApi.updateMe(payload);
  await refreshProfile();
}

export async function changePassword(payload) {
  return usersApi.updatePassword(payload);
}

export async function changePhoto(file) {
  await usersApi.updatePhoto(file);
  await refreshProfile();
}
