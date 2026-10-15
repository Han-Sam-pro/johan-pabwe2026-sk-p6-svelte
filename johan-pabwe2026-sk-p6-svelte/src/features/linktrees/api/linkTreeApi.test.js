import { describe, it, expect, vi, beforeEach } from "vitest";

const apiFetchMock = vi.hoisted(() => vi.fn());

vi.mock("../../../helpers/apiHelper.js", () => ({
  apiFetch: apiFetchMock,
}));

import {
  createLinkTree,
  createLinkTreeItem,
  deleteAllLinkTrees,
  deleteLinkTree,
  deleteLinkTreeItem,
  getLinkTree,
  getLinkTrees,
  updateLinkTree,
  updateLinkTreeCover,
  updateLinkTreeItem,
} from "./linkTreeApi.js";

describe("linkTreeApi", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("getLinkTrees mengambil semua link tree bila isMe tidak diberikan", async () => {
    apiFetchMock.mockResolvedValue({ status: "success", data: { link_trees: [{ id: 1 }] } });

    await expect(getLinkTrees()).resolves.toEqual([{ id: 1 }]);
    expect(apiFetchMock).toHaveBeenCalledWith("/link-trees", { query: { is_me: null } });
  });

  it("getLinkTrees mengirim is_me=1 untuk milik saya", async () => {
    apiFetchMock.mockResolvedValue({ status: "success", data: { link_trees: [] } });

    await getLinkTrees(true);

    expect(apiFetchMock).toHaveBeenCalledWith("/link-trees", { query: { is_me: 1 } });
  });

  it("getLinkTree mengembalikan detail beserta items", async () => {
    apiFetchMock.mockResolvedValue({ status: "success", data: { link_tree: { id: 4, items: [] } } });

    await expect(getLinkTree(4)).resolves.toEqual({ id: 4, items: [] });
    expect(apiFetchMock).toHaveBeenCalledWith("/link-trees/4");
  });

  it("createLinkTree mengirim title, type, dan description lalu mengembalikan id", async () => {
    apiFetchMock.mockResolvedValue({ status: "success", data: { link_tree_id: 9 } });

    const id = await createLinkTree({ title: "Sosmed", type: "public", description: "Akun saya", extra: "x" });

    expect(id).toBe(9);
    expect(apiFetchMock).toHaveBeenCalledWith("/link-trees", {
      method: "POST",
      body: { title: "Sosmed", type: "public", description: "Akun saya" },
    });
  });

  it("updateLinkTree mengirim PUT", async () => {
    apiFetchMock.mockResolvedValue({ status: "success" });

    await updateLinkTree(2, { title: "Baru", type: "private", description: "" });

    expect(apiFetchMock).toHaveBeenCalledWith("/link-trees/2", {
      method: "PUT",
      body: { title: "Baru", type: "private", description: "" },
    });
  });

  it("updateLinkTreeCover mengirim file sebagai formData", async () => {
    apiFetchMock.mockResolvedValue({ status: "success" });
    const file = new File(["x"], "cover.jpg", { type: "image/jpeg" });

    await updateLinkTreeCover(3, file);

    const [path, options] = apiFetchMock.mock.calls[0];
    expect(path).toBe("/link-trees/3/cover");
    expect(options.method).toBe("POST");
    expect(options.formData.get("cover")).toBeInstanceOf(File);
  });

  it("deleteLinkTree dan deleteAllLinkTrees mengirim DELETE", async () => {
    apiFetchMock.mockResolvedValue({ status: "success" });

    await deleteLinkTree(5);
    await deleteAllLinkTrees();

    expect(apiFetchMock).toHaveBeenNthCalledWith(1, "/link-trees/5", { method: "DELETE" });
    expect(apiFetchMock).toHaveBeenNthCalledWith(2, "/link-trees", { method: "DELETE" });
  });

  it("createLinkTreeItem mengirim title dan url lalu mengembalikan item_id", async () => {
    apiFetchMock.mockResolvedValue({ status: "success", data: { item_id: 11 } });

    await expect(createLinkTreeItem(2, { title: "Blog", url: "https://a.id" })).resolves.toBe(11);
    expect(apiFetchMock).toHaveBeenCalledWith("/link-trees/2/items", {
      method: "POST",
      body: { title: "Blog", url: "https://a.id" },
    });
  });

  it("updateLinkTreeItem dan deleteLinkTreeItem memakai id tautan dan id item", async () => {
    apiFetchMock.mockResolvedValue({ status: "success" });

    await updateLinkTreeItem(2, 11, { title: "Blog", url: "https://b.id" });
    await deleteLinkTreeItem(2, 11);

    expect(apiFetchMock).toHaveBeenNthCalledWith(1, "/link-trees/2/items/11", {
      method: "PUT",
      body: { title: "Blog", url: "https://b.id" },
    });
    expect(apiFetchMock).toHaveBeenNthCalledWith(2, "/link-trees/2/items/11", { method: "DELETE" });
  });
});
