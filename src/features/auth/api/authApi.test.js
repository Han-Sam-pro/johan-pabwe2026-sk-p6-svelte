import { describe, it, expect, vi, beforeEach } from "vitest";

const apiFetchMock = vi.hoisted(() => vi.fn());

vi.mock("../../../helpers/apiHelper.js", () => ({
  apiFetch: apiFetchMock,
}));

import { login, logout, register } from "./authApi.js";

describe("authApi", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("register mengirim name, email, dan password tanpa token", async () => {
    apiFetchMock.mockResolvedValue({ status: "success" });

    await register({ name: "Budi", email: "budi@mail.com", password: "rahasia", extra: "x" });

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "Budi", email: "budi@mail.com", password: "rahasia" },
      auth: false,
    });
  });

  it("login mengembalikan data berisi user dan token", async () => {
    const data = { user: { id: 1, name: "Budi" }, token: "tok" };
    apiFetchMock.mockResolvedValue({ status: "success", data });

    const result = await login("budi@mail.com", "rahasia");

    expect(result).toEqual(data);
    expect(apiFetchMock).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "budi@mail.com", password: "rahasia" },
      auth: false,
    });
  });

  it("logout memanggil endpoint logout dengan token", async () => {
    apiFetchMock.mockResolvedValue({ status: "success" });

    await logout();

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
  });
});
