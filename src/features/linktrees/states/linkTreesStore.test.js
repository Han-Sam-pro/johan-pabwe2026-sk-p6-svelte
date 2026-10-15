import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";

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

import {
  addItem,
  changeCover,
  createLinkTree,
  filterLinkTrees,
  linkTreeStats,
  linkTrees,
  loadLinkTree,
  loadLinkTrees,
  mutations,
  removeAllLinkTrees,
  removeItem,
  removeLinkTree,
  searchQuery,
  selectedLinkTree,
  setShowOnlyMine,
  showOnlyMine,
  updateItem,
  updateLinkTree,
  visibleLinkTrees,
} from "./linkTreesStore.js";

const sample = [
  { id: 1, title: "Sosmed Budi", description: "Instagram", type: "public", total_links: 3, author: { name: "Budi" } },
  { id: 2, title: "Portofolio", description: null, type: "private", total_links: 1, author: null },
  { id: 3, title: "Rahasia", description: "Draf", type: "unlisted", author: { name: "Sari" } },
];

const idleMutations = {
  isAdding: false,
  isChanging: false,
  isChangingCover: false,
  isDeleting: false,
  isDeletingAll: false,
  isMutatingItem: false,
};

describe("linkTreesStore - filterLinkTrees", () => {
  it("mengembalikan daftar apa adanya bila kata kunci kosong", () => {
    expect(filterLinkTrees(sample, "   ")).toBe(sample);
  });

  it("mencocokkan judul, deskripsi, dan nama pemilik tanpa membedakan huruf", () => {
    expect(filterLinkTrees(sample, "SOSMED").map((item) => item.id)).toEqual([1]);
    expect(filterLinkTrees(sample, "instagram").map((item) => item.id)).toEqual([1]);
    expect(filterLinkTrees(sample, "sari").map((item) => item.id)).toEqual([3]);
  });

  it("tidak cocok bila tidak ada field yang sesuai, termasuk deskripsi dan pemilik null", () => {
    expect(filterLinkTrees(sample, "tidak-ada")).toEqual([]);
    expect(filterLinkTrees(sample, "portofolio").map((item) => item.id)).toEqual([2]);
  });
});

describe("linkTreesStore - turunan", () => {
  beforeEach(() => {
    linkTrees.set(sample);
    searchQuery.set("");
  });

  it("visibleLinkTrees mengikuti kata pencarian", () => {
    searchQuery.set("draf");

    expect(get(visibleLinkTrees).map((item) => item.id)).toEqual([3]);
  });

  it("linkTreeStats menghitung total, total tautan, dan jumlah per tipe", () => {
    expect(get(linkTreeStats)).toEqual({
      total: 3,
      totalLinks: 4,
      public: 1,
      unlisted: 1,
      private: 1,
    });
  });

  it("linkTreeStats menganggap total tautan kosong sebagai nol", () => {
    linkTrees.set([{ id: 9, type: "public" }]);

    expect(get(linkTreeStats).totalLinks).toBe(0);
  });
});

describe("linkTreesStore - pemuatan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    linkTrees.set([]);
    selectedLinkTree.set(null);
    showOnlyMine.set(false);
  });

  it("loadLinkTrees memuat semua link tree bila filter milik saya mati", async () => {
    apiMock.getLinkTrees.mockResolvedValue(sample);

    await loadLinkTrees();

    expect(apiMock.getLinkTrees).toHaveBeenCalledWith(false);
    expect(get(linkTrees)).toEqual(sample);
  });

  it("setShowOnlyMine menyimpan filter lalu memuat milik saya", async () => {
    apiMock.getLinkTrees.mockResolvedValue([sample[0]]);

    await setShowOnlyMine(true);

    expect(get(showOnlyMine)).toBe(true);
    expect(apiMock.getLinkTrees).toHaveBeenCalledWith(true);
    expect(get(linkTrees)).toEqual([sample[0]]);
  });

  it("loadLinkTree menyimpan detail link tree", async () => {
    apiMock.getLinkTree.mockResolvedValue({ id: 4, items: [] });

    await loadLinkTree(4);

    expect(get(selectedLinkTree)).toEqual({ id: 4, items: [] });
  });
});

describe("linkTreesStore - mutasi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    linkTrees.set([]);
    selectedLinkTree.set(null);
    mutations.set({ ...idleMutations });
    apiMock.getLinkTrees.mockResolvedValue([]);
    apiMock.getLinkTree.mockResolvedValue({ id: 7, items: [] });
  });

  it("createLinkTree membuat link tree, memuat ulang daftar, dan mengembalikan id", async () => {
    apiMock.createLinkTree.mockResolvedValue(12);

    const id = await createLinkTree({ title: "Baru", type: "public", description: "" });

    expect(id).toBe(12);
    expect(apiMock.getLinkTrees).toHaveBeenCalled();
    expect(get(mutations).isAdding).toBe(false);
  });

  it("updateLinkTree memperbarui data lalu memuat detail dan daftar", async () => {
    await updateLinkTree(7, { title: "Ubah", type: "private", description: "x" });

    expect(apiMock.updateLinkTree).toHaveBeenCalledWith(7, { title: "Ubah", type: "private", description: "x" });
    expect(get(selectedLinkTree)).toEqual({ id: 7, items: [] });
    expect(apiMock.getLinkTrees).toHaveBeenCalled();
  });

  it("changeCover mengunggah cover lalu memuat ulang", async () => {
    const file = new File(["x"], "c.jpg", { type: "image/jpeg" });

    await changeCover(7, file);

    expect(apiMock.updateLinkTreeCover).toHaveBeenCalledWith(7, file);
    expect(get(selectedLinkTree).id).toBe(7);
  });

  it("removeLinkTree menghapus dan mengosongkan detail", async () => {
    selectedLinkTree.set({ id: 7 });

    await removeLinkTree(7);

    expect(apiMock.deleteLinkTree).toHaveBeenCalledWith(7);
    expect(get(selectedLinkTree)).toBeNull();
  });

  it("removeAllLinkTrees menghapus semua dan mengosongkan detail", async () => {
    selectedLinkTree.set({ id: 7 });

    await removeAllLinkTrees();

    expect(apiMock.deleteAllLinkTrees).toHaveBeenCalledOnce();
    expect(get(selectedLinkTree)).toBeNull();
  });

  it("addItem, updateItem, dan removeItem memanggil API item lalu memuat ulang detail", async () => {
    await addItem(7, { title: "Blog", url: "https://a.id" });
    await updateItem(7, 3, { title: "Blog", url: "https://b.id" });
    await removeItem(7, 3);

    expect(apiMock.createLinkTreeItem).toHaveBeenCalledWith(7, { title: "Blog", url: "https://a.id" });
    expect(apiMock.updateLinkTreeItem).toHaveBeenCalledWith(7, 3, { title: "Blog", url: "https://b.id" });
    expect(apiMock.deleteLinkTreeItem).toHaveBeenCalledWith(7, 3);
    expect(apiMock.getLinkTree).toHaveBeenCalledTimes(3);
  });

  it("mengembalikan bendera mutasi ke false walaupun permintaan gagal", async () => {
    apiMock.deleteLinkTree.mockRejectedValue(new Error("Gagal"));

    await expect(removeLinkTree(7)).rejects.toThrow("Gagal");
    expect(get(mutations).isDeleting).toBe(false);
  });

  it("menyalakan bendera mutasi yang sesuai selama permintaan berjalan", async () => {
    let resolveDelete;
    apiMock.deleteAllLinkTrees.mockReturnValue(new Promise((resolve) => (resolveDelete = resolve)));

    const pending = removeAllLinkTrees();
    expect(get(mutations).isDeletingAll).toBe(true);

    resolveDelete({ status: "success" });
    await pending;
    expect(get(mutations).isDeletingAll).toBe(false);
  });
});
