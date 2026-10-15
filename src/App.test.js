import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import { renderWithProviders } from "./test-utils.js";
import { currentPath } from "./navigation.js";

const linkTreeApiMock = vi.hoisted(() => ({
  getLinkTrees: vi.fn(),
  getLinkTree: vi.fn(),
  createLinkTree: vi.fn(),
  updateLinkTree: vi.fn(),
  updateLinkTreeCover: vi.fn(),
  deleteLinkTree: vi.fn(),
  deleteAllLinkTrees: vi.fn(),
  createLinkTreeItem: vi.fn(),
  updateLinkTreeItem: vi.fn(),
  deleteLinkTreeItem: vi.fn(),
}));

const usersApiMock = vi.hoisted(() => ({
  getMe: vi.fn(),
  getUsers: vi.fn(),
  updateMe: vi.fn(),
  updatePassword: vi.fn(),
  updatePhoto: vi.fn(),
}));

vi.mock("./features/linktrees/api/linkTreeApi.js", () => linkTreeApiMock);
vi.mock("./features/users/api/usersApi.js", () => usersApiMock);

import App from "./App.svelte";

describe("App - rute tamu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mengarahkan tamu dari beranda ke halaman masuk", async () => {
    const { findByRole } = renderWithProviders(App, { route: "/" });

    expect(await findByRole("heading", { name: "Masuk", level: 2 })).toBeInTheDocument();
    expect(get(currentPath)).toBe("/auth/login");
  });

  it("menampilkan halaman masuk dengan judul Delcom Link Tree", async () => {
    const { findByRole, getByRole } = renderWithProviders(App, { route: "/auth/login" });

    expect(await findByRole("heading", { name: "Delcom Link Tree", level: 1 })).toBeInTheDocument();
    expect(getByRole("button", { name: "Masuk" })).toBeInTheDocument();
  });

  it("menampilkan halaman daftar akun", async () => {
    const { findByRole } = renderWithProviders(App, { route: "/auth/register" });

    expect(await findByRole("heading", { name: "Daftar Akun" })).toBeInTheDocument();
  });
});

describe("App - rute terautentikasi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mengarahkan pengguna login dari halaman masuk ke beranda", async () => {
    linkTreeApiMock.getLinkTrees.mockResolvedValue([]);

    const { findByRole } = renderWithProviders(App, { route: "/auth/login", token: "tok" });

    expect(await findByRole("heading", { name: "Semua Link Tree" })).toBeInTheDocument();
    expect(get(currentPath)).toBe("/");
  });

  it("menampilkan detail link tree dengan parameter dari URL", async () => {
    linkTreeApiMock.getLinkTree.mockResolvedValue({
      id: 9,
      title: "Link Sembilan",
      description: "",
      type: "unlisted",
      cover: null,
      created_at: null,
      author: { name: "Budi", photo: null },
      items: [],
    });

    const { findByRole } = renderWithProviders(App, { route: "/link-trees/9", token: "tok" });

    expect(await findByRole("heading", { name: "Link Sembilan", level: 1 })).toBeInTheDocument();
    expect(linkTreeApiMock.getLinkTree).toHaveBeenCalledWith("9");
  });

  it("menampilkan daftar pengguna", async () => {
    usersApiMock.getUsers.mockResolvedValue([]);

    const { findByRole } = renderWithProviders(App, { route: "/users", token: "tok" });

    expect(await findByRole("heading", { name: "Daftar Pengguna" })).toBeInTheDocument();
  });

  it("menampilkan profil pengguna", async () => {
    usersApiMock.getMe.mockResolvedValue({ id: 1, name: "Budi", email: "budi@mail.com", photo: null });

    const { findByRole } = renderWithProviders(App, { route: "/profile", token: "tok" });

    expect(await findByRole("heading", { name: "Profil Saya" })).toBeInTheDocument();
  });
});

describe("App - rute tidak dikenal", () => {
  it("menampilkan halaman 404 untuk path yang tidak cocok", async () => {
    const { findByRole } = renderWithProviders(App, { route: "/tidak-ada" });

    expect(await findByRole("heading", { name: "Halaman tidak ditemukan" })).toBeInTheDocument();
  });
});
