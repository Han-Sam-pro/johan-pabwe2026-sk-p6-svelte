import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/svelte";
import { renderWithProviders } from "../../../test-utils.js";
import { users } from "../states/usersStore.js";
import * as toolsHelper from "../../../helpers/toolsHelper.js";

const apiMock = vi.hoisted(() => ({
  getMe: vi.fn(),
  getUsers: vi.fn(),
  updateMe: vi.fn(),
  updatePassword: vi.fn(),
  updatePhoto: vi.fn(),
}));

vi.mock("../api/usersApi.js", () => apiMock);
vi.mock("../../../helpers/toolsHelper.js");

import UsersPage from "./UsersPage.svelte";

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    users.set([]);
  });

  it("menampilkan pesan memuat saat data belum tiba", () => {
    apiMock.getUsers.mockReturnValue(new Promise(() => {}));

    const { getByText } = renderWithProviders(UsersPage, { token: "tok" });

    expect(getByText("Memuat pengguna...")).toBeInTheDocument();
  });

  it("menampilkan daftar pengguna lengkap dengan foto atau inisial", async () => {
    apiMock.getUsers.mockResolvedValue([
      { id: 1, name: "budi", email: "budi@mail.com", photo: "img/photo/1.png", created_at: "2026-10-01T00:00:00Z" },
      { id: 2, name: "Sari", email: "sari@mail.com", photo: null, created_at: null },
    ]);

    const { findByText, getByRole, getByText } = renderWithProviders(UsersPage, { token: "tok" });

    expect(await findByText("budi")).toBeInTheDocument();
    expect(getByText("sari@mail.com")).toBeInTheDocument();
    expect(getByRole("img", { name: "Foto budi" })).toHaveAttribute(
      "src",
      "http://localhost:8000/img/photo/1.png"
    );
    expect(getByText("S")).toBeInTheDocument();
  });

  it("menampilkan pesan kosong bila tidak ada pengguna", async () => {
    apiMock.getUsers.mockResolvedValue([]);

    const { findByText } = renderWithProviders(UsersPage, { token: "tok" });

    expect(await findByText("Belum ada pengguna.")).toBeInTheDocument();
  });

  it("menampilkan dialog error bila pemuatan gagal", async () => {
    apiMock.getUsers.mockRejectedValue(new Error("Tidak diizinkan"));

    renderWithProviders(UsersPage, { token: "tok" });

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Tidak diizinkan"));
  });
});
