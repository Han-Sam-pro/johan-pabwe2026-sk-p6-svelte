import { apiFetch } from "../../../helpers/apiHelper.js";

/** Mengambil daftar link tree. isMe true hanya mengembalikan milik pengguna yang login. */
export async function getLinkTrees(isMe = false) {
  const json = await apiFetch("/link-trees", { query: { is_me: isMe ? 1 : null } });
  return json.data.link_trees;
}

export async function getLinkTree(linkTreeId) {
  const json = await apiFetch(`/link-trees/${linkTreeId}`);
  return json.data.link_tree;
}

/** Membuat link tree dan mengembalikan id-nya. */
export async function createLinkTree({ title, type, description }) {
  const json = await apiFetch("/link-trees", {
    method: "POST",
    body: { title, type, description },
  });
  return json.data.link_tree_id;
}

export async function updateLinkTree(linkTreeId, { title, type, description }) {
  return apiFetch(`/link-trees/${linkTreeId}`, {
    method: "PUT",
    body: { title, type, description },
  });
}

/** Mengunggah atau mengganti cover dengan multipart/form-data. */
export async function updateLinkTreeCover(linkTreeId, file) {
  const formData = new FormData();
  formData.append("cover", file);

  return apiFetch(`/link-trees/${linkTreeId}/cover`, {
    method: "POST",
    formData,
  });
}

export async function deleteLinkTree(linkTreeId) {
  return apiFetch(`/link-trees/${linkTreeId}`, { method: "DELETE" });
}

export async function deleteAllLinkTrees() {
  return apiFetch("/link-trees", { method: "DELETE" });
}

/** Menambah item tautan dan mengembalikan id item baru. */
export async function createLinkTreeItem(linkTreeId, { title, url }) {
  const json = await apiFetch(`/link-trees/${linkTreeId}/items`, {
    method: "POST",
    body: { title, url },
  });
  return json.data.item_id;
}

export async function updateLinkTreeItem(linkTreeId, itemId, { title, url }) {
  return apiFetch(`/link-trees/${linkTreeId}/items/${itemId}`, {
    method: "PUT",
    body: { title, url },
  });
}

export async function deleteLinkTreeItem(linkTreeId, itemId) {
  return apiFetch(`/link-trees/${linkTreeId}/items/${itemId}`, { method: "DELETE" });
}
