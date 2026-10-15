import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";

const apiMock = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("../api/authApi.js", () => apiMock);

import { authStore, isAuthenticated, login, logout, register } from "./authStore.js";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper.js";

describe("authStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authStore.set({ token: null, user: null });
  });

  it("isAuthenticated bernilai false bila token kosong", () => {
    expect(get(isAuthenticated)).toBe(false);
  });

  it("isAuthenticated bernilai true bila token tersedia", () => {
    authStore.set({ token: "abc", user: null });

    expect(get(isAuthenticated)).toBe(true);
  });

  it("login menyimpan token ke localStorage dan memperbarui store", async () => {
    const user = { id: 1, name: "Budi" };
    apiMock.login.mockResolvedValue({ user, token: "tok-1" });

    const result = await login("budi@mail.com", "rahasia");

    expect(result).toEqual(user);
    expect(apiMock.login).toHaveBeenCalledWith("budi@mail.com", "rahasia");
    expect(getAccessToken()).toBe("tok-1");
    expect(get(authStore)).toEqual({ token: "tok-1", user });
    expect(get(isAuthenticated)).toBe(true);
  });

  it("login meneruskan error ke pemanggil dan tidak menyimpan token", async () => {
    apiMock.login.mockRejectedValue(new Error("Kredensial salah"));

    await expect(login("x@mail.com", "salah")).rejects.toThrow("Kredensial salah");
    expect(getAccessToken()).toBeNull();
    expect(get(isAuthenticated)).toBe(false);
  });

  it("register meneruskan payload ke API", async () => {
    apiMock.register.mockResolvedValue({ status: "success" });
    const payload = { name: "Budi", email: "budi@mail.com", password: "rahasia" };

    const result = await register(payload);

    expect(apiMock.register).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ status: "success" });
  });

  it("logout menghapus sesi lokal setelah API berhasil", async () => {
    putAccessToken("tok-1");
    authStore.set({ token: "tok-1", user: { id: 1 } });
    apiMock.logout.mockResolvedValue({ status: "success" });

    await logout();

    expect(apiMock.logout).toHaveBeenCalledOnce();
    expect(getAccessToken()).toBeNull();
    expect(get(authStore)).toEqual({ token: null, user: null });
  });

  it("logout tetap menghapus sesi lokal bila API gagal lalu meneruskan error", async () => {
    putAccessToken("tok-1");
    authStore.set({ token: "tok-1", user: null });
    apiMock.logout.mockRejectedValue(new Error("Unauthenticated."));

    await expect(logout()).rejects.toThrow("Unauthenticated.");
    expect(getAccessToken()).toBeNull();
    expect(get(isAuthenticated)).toBe(false);
  });
});
