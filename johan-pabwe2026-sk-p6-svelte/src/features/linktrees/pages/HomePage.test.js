import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { renderWithProviders } from "../../../test-utils.js";
import { linkTrees, mutations, searchQuery, selectedLinkTree, showOnlyMine } from "../states/linkTreesStore.js";
import * as toolsHelper from "../../../helpers/toolsHelper.js";

const apiMock = vi.hoisted(() => ({
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

vi.mock("../api/linkTreeApi.js", () => apiMock);
vi.mock("../../../helpers/toolsHelper.js");

import HomePage from "./HomePage.svelte";

const sample = [
  {
    id: 1,
    title: "Sosmed Budi",
    description: "Instagram dan X",
    type: "public",
    cover: null,
    created_at: "2026-10-01T00:00:00Z",
    author: { name: "Budi", photo: null },
    total_links: 3,
  },
  {
    id: 2,
    title: "Portofolio",
    description: "Karya desain",
    type: "private",
    cover: null,
    created_at: null,
    author: { name: "Sari", photo: null },
    total_links: 1,
  },
];

const idleMutations = {
  isAdding: false,
  isChanging: false,
  isChangingCover: false,
  isDeleting: false,
  isDeletingAll: false,
  isMutatingItem: false,
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    linkTrees.set([]);
    selectedLinkTree.set(null);
    searchQuery.set("");
    showOnlyMine.set(false);
    mutations.set({ ...idleMutations });
    window.history.replaceState({}, "", "/");
    apiMock.getLinkTrees.mockResolvedValue(sample);
  });

  it("memuat daftar dan menampilkan kartu link tree", async () => {
    const { findByRole } = renderWithProviders(HomePage, { token: "tok" });

    expect(await findByRole("link", { name: "Sosmed Budi" })).toBeInTheDocument();
    expect(apiMock.getLinkTrees).toHaveBeenCalledWith(false);
  });

  it("menampilkan statistik dari daftar yang dimuat", async () => {
    const { findByRole, getByText } = renderWithProviders(HomePage, { token: "tok" });
    await findByRole("link", { name: "Sosmed Budi" });

    expect(getByText("Total link tree", { selector: "p" }).nextElementSibling).toHaveTextContent("2");
    expect(getByText("Total tautan", { selector: "p" }).nextElementSibling).toHaveTextContent("4");
    expect(getByText("Publik", { selector: "p" }).nextElementSibling).toHaveTextContent("1");
    expect(getByText("Tidak terdaftar", { selector: "p" }).nextElementSibling).toHaveTextContent("0");
    expect(getByText("Privat", { selector: "p" }).nextElementSibling).toHaveTextContent("1");
  });

  it("menampilkan pesan memuat saat data belum tiba", () => {
    apiMock.getLinkTrees.mockReturnValue(new Promise(() => {}));

    const { getByText } = renderWithProviders(HomePage, { token: "tok" });

    expect(getByText("Memuat link tree...")).toBeInTheDocument();
  });

  it("menampilkan pesan kosong bila belum ada link tree", async () => {
    apiMock.getLinkTrees.mockResolvedValue([]);

    const { findByText, queryByRole } = renderWithProviders(HomePage, { token: "tok" });

    expect(await findByText("Belum ada link tree.")).toBeInTheDocument();
    expect(queryByRole("button", { name: "Hapus Semua" })).toBeNull();
  });

  it("menampilkan dialog error bila pemuatan gagal", async () => {
    apiMock.getLinkTrees.mockRejectedValue(new Error("Gagal memuat"));

    renderWithProviders(HomePage, { token: "tok" });

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal memuat"));
  });

  it("mencari berdasarkan judul, deskripsi, atau pemilik", async () => {
    const { findByRole, getByLabelText, queryByRole } = renderWithProviders(HomePage, { token: "tok" });
    await findByRole("link", { name: "Sosmed Budi" });

    await fireEvent.input(getByLabelText("Cari link tree"), { target: { value: "karya" } });

    expect(queryByRole("link", { name: "Sosmed Budi" })).toBeNull();
    expect(queryByRole("link", { name: "Portofolio" })).toBeInTheDocument();
  });

  it("menampilkan pesan bila pencarian tidak menemukan hasil", async () => {
    const { findByRole, getByLabelText, getByText } = renderWithProviders(HomePage, { token: "tok" });
    await findByRole("link", { name: "Sosmed Budi" });

    await fireEvent.input(getByLabelText("Cari link tree"), { target: { value: "tidak-ada" } });

    expect(getByText("Tidak ada hasil untuk pencarian ini.")).toBeInTheDocument();
  });

  it("filter milik saya memuat ulang daftar dengan is_me", async () => {
    const { findByRole, getByRole } = renderWithProviders(HomePage, { token: "tok" });
    await findByRole("link", { name: "Sosmed Budi" });
    apiMock.getLinkTrees.mockResolvedValue([sample[0]]);

    await fireEvent.click(getByRole("checkbox"));

    await waitFor(() => expect(apiMock.getLinkTrees).toHaveBeenLastCalledWith(true));
  });

  it("menampilkan error bila filter milik saya gagal", async () => {
    const { findByRole, getByRole } = renderWithProviders(HomePage, { token: "tok" });
    await findByRole("link", { name: "Sosmed Budi" });
    apiMock.getLinkTrees.mockRejectedValue(new Error("Filter gagal"));

    await fireEvent.click(getByRole("checkbox"));

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Filter gagal"));
  });

  it("menghapus link tree setelah dikonfirmasi", async () => {
    toolsHelper.showConfirmDialog.mockResolvedValue(true);
    apiMock.deleteLinkTree.mockResolvedValue({ status: "success" });
    const { findByRole, getAllByRole } = renderWithProviders(HomePage, { token: "tok" });
    await findByRole("link", { name: "Sosmed Budi" });

    await fireEvent.click(getAllByRole("button", { name: "Hapus link tree" })[0]);

    await waitFor(() => expect(apiMock.deleteLinkTree).toHaveBeenCalledWith(1));
    expect(toolsHelper.showConfirmDialog).toHaveBeenCalledWith(
      'Hapus link tree "Sosmed Budi" beserta tautannya?'
    );
  });

  it("tidak menghapus bila konfirmasi dibatalkan", async () => {
    toolsHelper.showConfirmDialog.mockResolvedValue(false);
    const { findByRole, getAllByRole } = renderWithProviders(HomePage, { token: "tok" });
    await findByRole("link", { name: "Sosmed Budi" });

    await fireEvent.click(getAllByRole("button", { name: "Hapus link tree" })[0]);

    await waitFor(() => expect(toolsHelper.showConfirmDialog).toHaveBeenCalled());
    expect(apiMock.deleteLinkTree).not.toHaveBeenCalled();
  });

  it("menampilkan error bila penghapusan gagal", async () => {
    toolsHelper.showConfirmDialog.mockResolvedValue(true);
    apiMock.deleteLinkTree.mockRejectedValue(new Error("Gagal hapus"));
    const { findByRole, getAllByRole } = renderWithProviders(HomePage, { token: "tok" });
    await findByRole("link", { name: "Sosmed Budi" });

    await fireEvent.click(getAllByRole("button", { name: "Hapus link tree" })[0]);

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal hapus"));
  });

  it("menghapus semua link tree setelah dikonfirmasi", async () => {
    toolsHelper.showConfirmDialog.mockResolvedValue(true);
    apiMock.deleteAllLinkTrees.mockResolvedValue({ status: "success" });
    const { findByRole, getByRole } = renderWithProviders(HomePage, { token: "tok" });
    await findByRole("link", { name: "Sosmed Budi" });

    await fireEvent.click(getByRole("button", { name: "Hapus Semua" }));

    await waitFor(() => expect(apiMock.deleteAllLinkTrees).toHaveBeenCalledOnce());
  });

  it("tidak menghapus semua bila konfirmasi dibatalkan", async () => {
    toolsHelper.showConfirmDialog.mockResolvedValue(false);
    const { findByRole, getByRole } = renderWithProviders(HomePage, { token: "tok" });
    await findByRole("link", { name: "Sosmed Budi" });

    await fireEvent.click(getByRole("button", { name: "Hapus Semua" }));

    await waitFor(() => expect(toolsHelper.showConfirmDialog).toHaveBeenCalled());
    expect(apiMock.deleteAllLinkTrees).not.toHaveBeenCalled();
  });

  it("menampilkan teks menghapus saat penghapusan semua berjalan", async () => {
    mutations.set({ ...idleMutations, isDeletingAll: true });
    apiMock.getLinkTrees.mockResolvedValue(sample);

    const { findByRole, getByRole } = renderWithProviders(HomePage, { token: "tok" });
    await findByRole("link", { name: "Sosmed Budi" });

    expect(getByRole("button", { name: "Menghapus..." })).toBeDisabled();
  });

  it("membuka dan menutup modal tambah link tree", async () => {
    const { findByRole, getByRole, queryByRole } = renderWithProviders(HomePage, { token: "tok" });
    await findByRole("link", { name: "Sosmed Budi" });

    await fireEvent.click(getByRole("button", { name: "Tambah Link Tree" }));
    expect(getByRole("dialog", { name: "Tambah Link Tree" })).toBeInTheDocument();

    await fireEvent.click(getByRole("button", { name: "Batal" }));
    expect(queryByRole("dialog", { name: "Tambah Link Tree" })).toBeNull();
  });
});
