import { describe, it, expect, vi, beforeEach } from "vitest";

const apiFetchMock = vi.hoisted(() => vi.fn());

vi.mock("../../../helpers/apiHelper.js", () => ({
  apiFetch: apiFetchMock,
}));

import { getMe, getUsers, updateMe, updatePassword, updatePhoto } from "./usersApi.js";

describe("usersApi", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("getMe mengembalikan data user", async () => {
    apiFetchMock.mockResolvedValue({ status: "success", data: { user: { id: 1, name: "Budi" } } });

    await expect(getMe()).resolves.toEqual({ id: 1, name: "Budi" });
    expect(apiFetchMock).toHaveBeenCalledWith("/users/me");
  });

  it("getUsers mengembalikan daftar pengguna", async () => {
    apiFetchMock.mockResolvedValue({ status: "success", data: { users: [{ id: 1 }, { id: 2 }] } });

    await expect(getUsers()).resolves.toEqual([{ id: 1 }, { id: 2 }]);
    expect(apiFetchMock).toHaveBeenCalledWith("/users");
  });

  it("updateMe mengirim PUT name dan email", async () => {
    apiFetchMock.mockResolvedValue({ status: "success" });

    await updateMe({ name: "Budi", email: "budi@mail.com" });

    expect(apiFetchMock).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "Budi", email: "budi@mail.com" },
    });
  });

  it("updatePassword memetakan field camelCase ke snake_case", async () => {
    apiFetchMock.mockResolvedValue({ status: "success" });

    await updatePassword({ password: "lama", newPassword: "baru", newPasswordConfirm: "baru" });

    expect(apiFetchMock).toHaveBeenCalledWith("/users/me/password", {
      method: "PUT",
      body: { password: "lama", new_password: "baru", new_password_confirm: "baru" },
    });
  });

  it("updatePhoto mengirim file sebagai formData", async () => {
    apiFetchMock.mockResolvedValue({ status: "success" });
    const file = new File(["x"], "foto.png", { type: "image/png" });

    await updatePhoto(file);

    const [path, options] = apiFetchMock.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.formData.get("photo")).toBeInstanceOf(File);
  });
});
