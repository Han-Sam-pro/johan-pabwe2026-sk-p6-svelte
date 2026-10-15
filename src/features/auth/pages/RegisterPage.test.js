import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { renderWithProviders } from "../../../test-utils.js";
import { currentPath } from "../../../navigation.js";
import * as toolsHelper from "../../../helpers/toolsHelper.js";
import { ApiError } from "../../../helpers/apiHelper.js";

const apiMock = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("../api/authApi.js", () => apiMock);
vi.mock("../../../helpers/toolsHelper.js");

import RegisterPage from "./RegisterPage.svelte";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/auth/register");
    currentPath.set("/auth/register");
  });

  it("menampilkan form pendaftaran", () => {
    const { getByLabelText, getByRole } = renderWithProviders(RegisterPage);

    expect(getByLabelText("Nama")).toBeInTheDocument();
    expect(getByLabelText("Email")).toBeInTheDocument();
    expect(getByLabelText("Kata sandi")).toBeInTheDocument();
    expect(getByRole("button", { name: "Daftar" })).toBeInTheDocument();
  });

  it("mendaftarkan akun lalu berpindah ke halaman masuk", async () => {
    apiMock.register.mockResolvedValue({ status: "success" });

    const { getByLabelText, container } = renderWithProviders(RegisterPage);

    await fireEvent.input(getByLabelText("Nama"), { target: { value: "Budi" } });
    await fireEvent.input(getByLabelText("Email"), { target: { value: "budi@mail.com" } });
    await fireEvent.input(getByLabelText("Kata sandi"), { target: { value: "rahasia" } });
    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(apiMock.register).toHaveBeenCalledWith({
        name: "Budi",
        email: "budi@mail.com",
        password: "rahasia",
      });
    });
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Pendaftaran berhasil. Silakan masuk.");
    expect(get(currentPath)).toBe("/auth/login");
  });

  it("menampilkan dialog error bila pendaftaran gagal", async () => {
    apiMock.register.mockRejectedValue(new ApiError("Email sudah terdaftar"));

    const { getByLabelText, container } = renderWithProviders(RegisterPage);

    await fireEvent.input(getByLabelText("Email"), { target: { value: "budi@mail.com" } });
    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Email sudah terdaftar");
    });
    expect(toolsHelper.showSuccessDialog).not.toHaveBeenCalled();
    expect(get(currentPath)).toBe("/auth/register");
  });

  it("tautan masuk berpindah ke halaman login", async () => {
    const { getByRole } = renderWithProviders(RegisterPage);

    await fireEvent.click(getByRole("link", { name: "Masuk" }));

    expect(get(currentPath)).toBe("/auth/login");
  });
});
