import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { renderWithProviders } from "../../../test-utils.js";
import { currentPath } from "../../../navigation.js";
import { selectedLinkTree } from "../states/linkTreesStore.js";
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

import DetailPage from "./DetailPage.svelte";

const detail = {
  id: 5,
  title: "Sosmed Budi",
  description: "Instagram dan X",
  type: "public",
  cover: null,
  created_at: "2026-10-03T00:00:00Z",
  author: { name: "Budi", photo: null },
  items: [{ id: 11, link_tree_id: 5, title: "Blog", url: "https://blog.id", created_at: null, updated_at: null }],
};

function renderDetail(linkTreeId = "5") {
  return renderWithProviders(DetailPage, { token: "tok", props: { params: { linkTreeId } } });
}

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectedLinkTree.set(null);
    window.history.replaceState({}, "", "/link-trees/5");
    currentPath.set("/link-trees/5");
    apiMock.getLinkTree.mockResolvedValue(detail);
  });

  it("menampilkan pesan memuat sebelum data tiba", () => {
    apiMock.getLinkTree.mockReturnValue(new Promise(() => {}));

    const { getByText } = renderDetail();

    expect(getByText("Memuat link tree...")).toBeInTheDocument();
  });

  it("menampilkan detail, pemilik, tipe, deskripsi, dan tautan", async () => {
    const { findByRole, getByText, getByRole } = renderDetail();

    expect(await findByRole("heading", { name: "Sosmed Budi", level: 1 })).toBeInTheDocument();
    expect(getByText("Publik")).toBeInTheDocument();
    expect(getByText("Instagram dan X")).toBeInTheDocument();
    expect(getByText(/Dibuat oleh Budi/)).toBeInTheDocument();
    expect(getByRole("link", { name: /https:\/\/blog\.id/ })).toHaveAttribute("target", "_blank");
    expect(apiMock.getLinkTree).toHaveBeenCalledWith("5");
  });

  it("menampilkan sampul bila link tree memilikinya", async () => {
    apiMock.getLinkTree.mockResolvedValue({ ...detail, cover: "https://cdn.example.com/s.jpg" });

    const { findByRole } = renderDetail();

    expect(await findByRole("img", { name: "Sampul Sosmed Budi" })).toHaveAttribute(
      "src",
      "https://cdn.example.com/s.jpg"
    );
  });

  it("menampilkan pesan kosong bila belum ada tautan", async () => {
    apiMock.getLinkTree.mockResolvedValue({ ...detail, items: [] });

    const { findByText } = renderDetail();

    expect(await findByText("Belum ada tautan.")).toBeInTheDocument();
  });

  it("menampilkan error lalu kembali ke beranda bila link tree tidak ditemukan", async () => {
    apiMock.getLinkTree.mockRejectedValue(new Error("Tidak ditemukan"));

    renderDetail("99");

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Tidak ditemukan"));
    expect(get(currentPath)).toBe("/");
  });

  it("memuat ulang detail saat parameter berubah", async () => {
    const { rerender, findByRole } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    apiMock.getLinkTree.mockResolvedValue({ ...detail, id: 6, title: "Lainnya" });
    await rerender({ params: { linkTreeId: "6" } });

    expect(await findByRole("heading", { name: "Lainnya", level: 1 })).toBeInTheDocument();
    expect(apiMock.getLinkTree).toHaveBeenLastCalledWith("6");
  });

  it("mengunggah sampul dari halaman detail lalu menutup modal", async () => {
    apiMock.updateLinkTreeCover.mockResolvedValue({ status: "success" });
    const file = new File(["x"], "sampul.jpg", { type: "image/jpeg" });
    const { findByRole, getByRole, getByLabelText, queryByRole, container } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    await fireEvent.click(getByRole("button", { name: "Ubah sampul" }));
    Object.defineProperty(getByLabelText("Gambar sampul"), "files", { value: [file], configurable: true });
    await fireEvent.change(getByLabelText("Gambar sampul"));
    await fireEvent.submit(container.querySelector("[role='dialog'] form"));

    await waitFor(() => expect(apiMock.updateLinkTreeCover).toHaveBeenCalledWith(5, file));
    await waitFor(() => expect(queryByRole("dialog", { name: "Ubah Sampul" })).toBeNull());
  });

  it("menambah tautan dari halaman detail lalu menutup modal", async () => {
    apiMock.createLinkTreeItem.mockResolvedValue(12);
    const { findByRole, getByRole, getByLabelText, queryByRole, container } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    await fireEvent.click(getByRole("button", { name: "Tambah tautan" }));
    await fireEvent.input(getByLabelText("Judul tautan"), { target: { value: "Toko" } });
    await fireEvent.input(getByLabelText("URL"), { target: { value: "https://toko.id" } });
    await fireEvent.submit(container.querySelector("[role='dialog'] form"));

    await waitFor(() =>
      expect(apiMock.createLinkTreeItem).toHaveBeenCalledWith(5, { title: "Toko", url: "https://toko.id" })
    );
    await waitFor(() => expect(queryByRole("dialog", { name: "Tambah Tautan" })).toBeNull());
  });

  it("membuka dan menutup modal ubah data", async () => {
    const { findByRole, getByRole, queryByRole } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    await fireEvent.click(getByRole("button", { name: "Ubah data" }));
    expect(getByRole("dialog", { name: "Ubah Link Tree" })).toBeInTheDocument();

    await fireEvent.click(getByRole("button", { name: "Batal" }));
    expect(queryByRole("dialog", { name: "Ubah Link Tree" })).toBeNull();
  });

  it("membuka dan menutup modal ubah sampul", async () => {
    const { findByRole, getByRole, queryByRole } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    await fireEvent.click(getByRole("button", { name: "Ubah sampul" }));
    expect(getByRole("dialog", { name: "Ubah Sampul" })).toBeInTheDocument();

    await fireEvent.click(getByRole("button", { name: "Batal" }));
    expect(queryByRole("dialog", { name: "Ubah Sampul" })).toBeNull();
  });

  it("membuka modal tambah tautan dengan form kosong", async () => {
    const { findByRole, getByRole, getByLabelText } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    await fireEvent.click(getByRole("button", { name: "Tambah tautan" }));

    expect(getByRole("dialog", { name: "Tambah Tautan" })).toBeInTheDocument();
    expect(getByLabelText("Judul tautan")).toHaveValue("");
  });

  it("membuka modal ubah tautan dengan data tautan yang dipilih", async () => {
    const { findByRole, getByRole, getByLabelText } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    await fireEvent.click(getByRole("button", { name: "Ubah tautan Blog" }));

    expect(getByRole("dialog", { name: "Ubah Tautan" })).toBeInTheDocument();
    expect(getByLabelText("URL")).toHaveValue("https://blog.id");
  });

  it("menghapus tautan setelah dikonfirmasi", async () => {
    toolsHelper.showConfirmDialog.mockResolvedValue(true);
    apiMock.deleteLinkTreeItem.mockResolvedValue({ status: "success" });
    const { findByRole, getByRole } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    await fireEvent.click(getByRole("button", { name: "Hapus tautan Blog" }));

    await waitFor(() => expect(apiMock.deleteLinkTreeItem).toHaveBeenCalledWith(5, 11));
    expect(toolsHelper.showConfirmDialog).toHaveBeenCalledWith('Hapus tautan "Blog"?');
  });

  it("tidak menghapus tautan bila konfirmasi dibatalkan", async () => {
    toolsHelper.showConfirmDialog.mockResolvedValue(false);
    const { findByRole, getByRole } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    await fireEvent.click(getByRole("button", { name: "Hapus tautan Blog" }));

    await waitFor(() => expect(toolsHelper.showConfirmDialog).toHaveBeenCalled());
    expect(apiMock.deleteLinkTreeItem).not.toHaveBeenCalled();
  });

  it("menampilkan error bila penghapusan tautan gagal", async () => {
    toolsHelper.showConfirmDialog.mockResolvedValue(true);
    apiMock.deleteLinkTreeItem.mockRejectedValue(new Error("Gagal hapus tautan"));
    const { findByRole, getByRole } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    await fireEvent.click(getByRole("button", { name: "Hapus tautan Blog" }));

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal hapus tautan"));
  });

  it("menghapus link tree setelah dikonfirmasi lalu kembali ke beranda", async () => {
    toolsHelper.showConfirmDialog.mockResolvedValue(true);
    apiMock.deleteLinkTree.mockResolvedValue({ status: "success" });
    const { findByRole, getByRole } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    await fireEvent.click(getByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(get(currentPath)).toBe("/"));
    expect(apiMock.deleteLinkTree).toHaveBeenCalledWith(5);
  });

  it("tidak menghapus link tree bila konfirmasi dibatalkan", async () => {
    toolsHelper.showConfirmDialog.mockResolvedValue(false);
    const { findByRole, getByRole } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    await fireEvent.click(getByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(toolsHelper.showConfirmDialog).toHaveBeenCalled());
    expect(apiMock.deleteLinkTree).not.toHaveBeenCalled();
  });

  it("menampilkan error dan tetap di halaman bila penghapusan link tree gagal", async () => {
    toolsHelper.showConfirmDialog.mockResolvedValue(true);
    apiMock.deleteLinkTree.mockRejectedValue(new Error("Gagal hapus"));
    const { findByRole, getByRole } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    await fireEvent.click(getByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal hapus"));
    expect(get(currentPath)).toBe("/link-trees/5");
  });

  it("tautan kembali berpindah ke daftar", async () => {
    const { findByRole, getByRole } = renderDetail();
    await findByRole("heading", { name: "Sosmed Budi", level: 1 });

    await fireEvent.click(getByRole("link", { name: "Kembali ke daftar" }));

    expect(get(currentPath)).toBe("/");
  });
});
