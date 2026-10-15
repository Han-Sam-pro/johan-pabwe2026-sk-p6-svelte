import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";

const apiMock = vi.hoisted(() => ({
  getMe: vi.fn(),
  getUsers: vi.fn(),
  updateMe: vi.fn(),
  updatePassword: vi.fn(),
  updatePhoto: vi.fn(),
}));

vi.mock("../api/usersApi.js", () => apiMock);

import { authStore } from "../../auth/states/authStore.js";
import { changePassword, changePhoto, loadUsers, refreshProfile, updateProfile, users } from "./usersStore.js";

describe("usersStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    users.set([]);
    authStore.set({ token: "tok", user: null });
  });

  it("loadUsers menyimpan daftar pengguna ke store", async () => {
    apiMock.getUsers.mockResolvedValue([{ id: 1, name: "Budi" }]);

    await loadUsers();

    expect(get(users)).toEqual([{ id: 1, name: "Budi" }]);
  });

  it("refreshProfile memperbarui user pada authStore dan mempertahankan token", async () => {
    apiMock.getMe.mockResolvedValue({ id: 1, name: "Budi" });

    const user = await refreshProfile();

    expect(user).toEqual({ id: 1, name: "Budi" });
    expect(get(authStore)).toEqual({ token: "tok", user: { id: 1, name: "Budi" } });
  });

  it("updateProfile mengirim perubahan lalu menyegarkan profil", async () => {
    apiMock.updateMe.mockResolvedValue({ status: "success" });
    apiMock.getMe.mockResolvedValue({ id: 1, name: "Baru" });

    await updateProfile({ name: "Baru", email: "b@mail.com" });

    expect(apiMock.updateMe).toHaveBeenCalledWith({ name: "Baru", email: "b@mail.com" });
    expect(get(authStore).user).toEqual({ id: 1, name: "Baru" });
  });

  it("changePassword meneruskan payload ke API", async () => {
    apiMock.updatePassword.mockResolvedValue({ status: "success" });
    const payload = { password: "a", newPassword: "b", newPasswordConfirm: "b" };

    await expect(changePassword(payload)).resolves.toEqual({ status: "success" });
    expect(apiMock.updatePassword).toHaveBeenCalledWith(payload);
  });

  it("changePhoto mengunggah foto lalu menyegarkan profil", async () => {
    const file = new File(["x"], "foto.png", { type: "image/png" });
    apiMock.updatePhoto.mockResolvedValue({ status: "success" });
    apiMock.getMe.mockResolvedValue({ id: 1, photo: "img/photo/1.png" });

    await changePhoto(file);

    expect(apiMock.updatePhoto).toHaveBeenCalledWith(file);
    expect(get(authStore).user).toEqual({ id: 1, photo: "img/photo/1.png" });
  });
});
