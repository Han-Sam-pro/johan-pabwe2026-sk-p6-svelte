import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { renderWithProviders } from "../../../test-utils.js";
import { currentPath } from "../../../navigation.js";
import { get } from "svelte/store";
import { authStore } from "../states/authStore.js";
import * as toolsHelper from "../../../helpers/toolsHelper.js";
import { ApiError } from "../../../helpers/apiHelper.js";

const apiMock = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("../api/authApi.js", () => apiMock);
vi.mock("../../../helpers/toolsHelper.js");

import LoginPage from "./LoginPage.svelte";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.set({ token: null, user: null });
    window.history.replaceState({}, "", "/auth/login");
    currentPath.set("/auth/login");
  });

  it("menampilkan form masuk", () => {
    const { getByLabelText, getByRole } = renderWithProviders(LoginPage);

    expect(getByLabelText("Email")).toBeInTheDocument();
    expect(getByLabelText("Kata sandi")).toBeInTheDocument();
    expect(getByRole("button", { name: "Masuk" })).toBeInTheDocument();
  });

  it("mengisi input dan mengirim kredensial ke login", async () => {
    apiMock.login.mockResolvedValue({ user: { id: 1 }, token: "tok" });

    const { getByLabelText, container } = renderWithProviders(LoginPage);

    await fireEvent.input(getByLabelText("Email"), { target: { value: "budi@mail.com" } });
    await fireEvent.input(getByLabelText("Kata sandi"), { target: { value: "rahasia" } });
    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(apiMock.login).toHaveBeenCalledWith("budi@mail.com", "rahasia");
    });
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Selamat datang kembali!");
    expect(get(authStore).token).toBe("tok");
    expect(get(currentPath)).toBe("/");
  });

  it("menampilkan dialog error bila login gagal", async () => {
    apiMock.login.mockRejectedValue(new ApiError("Kredensial akun tidak ditemukan"));

    const { getByLabelText, container } = renderWithProviders(LoginPage);

    await fireEvent.input(getByLabelText("Email"), { target: { value: "x@mail.com" } });
    await fireEvent.input(getByLabelText("Kata sandi"), { target: { value: "salah" } });
    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Kredensial akun tidak ditemukan");
    });
    expect(toolsHelper.showSuccessDialog).not.toHaveBeenCalled();
    expect(get(authStore).token).toBeNull();
  });

  it("menampilkan teks memproses saat permintaan berjalan", async () => {
    let resolveLogin;
    apiMock.login.mockReturnValue(new Promise((resolve) => (resolveLogin = resolve)));

    const { container, getByRole } = renderWithProviders(LoginPage);
    await fireEvent.submit(container.querySelector("form"));

    expect(getByRole("button", { name: "Memproses..." })).toBeDisabled();

    resolveLogin({ user: {}, token: "tok" });
    await waitFor(() => expect(getByRole("button", { name: "Masuk" })).not.toBeDisabled());
  });

  it("tautan daftar berpindah ke halaman registrasi", async () => {
    const { getByRole } = renderWithProviders(LoginPage);

    await fireEvent.click(getByRole("link", { name: "Daftar" }));

    expect(get(currentPath)).toBe("/auth/register");
  });
});
