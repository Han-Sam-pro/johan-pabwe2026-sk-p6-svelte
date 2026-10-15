import { derived, get, writable } from "svelte/store";
import * as linkTreeApi from "../api/linkTreeApi.js";

export const linkTrees = writable([]);
export const selectedLinkTree = writable(null);
export const showOnlyMine = writable(false);
export const searchQuery = writable("");

/** Bendera mutasi: true selama permintaan tulis sedang berjalan. */
export const mutations = writable({
  isAdding: false,
  isChanging: false,
  isChangingCover: false,
  isDeleting: false,
  isDeletingAll: false,
  isMutatingItem: false,
});

/** Mencocokkan judul, deskripsi, dan nama pemilik tanpa membedakan huruf besar-kecil. */
export function filterLinkTrees(list, query) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return list;

  return list.filter((linkTree) =>
    [linkTree.title, linkTree.description, linkTree.author?.name].some((value) =>
      (value ?? "").toLowerCase().includes(keyword)
    )
  );
}

function countByType(list, type) {
  return list.filter((linkTree) => linkTree.type === type).length;
}

export const visibleLinkTrees = derived([linkTrees, searchQuery], ([$linkTrees, $searchQuery]) =>
  filterLinkTrees($linkTrees, $searchQuery)
);

export const linkTreeStats = derived(linkTrees, ($linkTrees) => ({
  total: $linkTrees.length,
  totalLinks: $linkTrees.reduce((sum, linkTree) => sum + (linkTree.total_links ?? 0), 0),
  public: countByType($linkTrees, "public"),
  unlisted: countByType($linkTrees, "unlisted"),
  private: countByType($linkTrees, "private"),
}));

async function withMutation(flag, action) {
  mutations.update((state) => ({ ...state, [flag]: true }));
  try {
    return await action();
  } finally {
    mutations.update((state) => ({ ...state, [flag]: false }));
  }
}

export async function loadLinkTrees() {
  linkTrees.set(await linkTreeApi.getLinkTrees(get(showOnlyMine)));
}

export async function setShowOnlyMine(value) {
  showOnlyMine.set(value);
  await loadLinkTrees();
}

export async function loadLinkTree(linkTreeId) {
  selectedLinkTree.set(await linkTreeApi.getLinkTree(linkTreeId));
}

async function refreshLinkTree(linkTreeId) {
  await loadLinkTree(linkTreeId);
  await loadLinkTrees();
}

export function createLinkTree(payload) {
  return withMutation("isAdding", async () => {
    const linkTreeId = await linkTreeApi.createLinkTree(payload);
    await loadLinkTrees();
    return linkTreeId;
  });
}

export function updateLinkTree(linkTreeId, payload) {
  return withMutation("isChanging", async () => {
    await linkTreeApi.updateLinkTree(linkTreeId, payload);
    await refreshLinkTree(linkTreeId);
  });
}

export function changeCover(linkTreeId, file) {
  return withMutation("isChangingCover", async () => {
    await linkTreeApi.updateLinkTreeCover(linkTreeId, file);
    await refreshLinkTree(linkTreeId);
  });
}

export function removeLinkTree(linkTreeId) {
  return withMutation("isDeleting", async () => {
    await linkTreeApi.deleteLinkTree(linkTreeId);
    selectedLinkTree.set(null);
    await loadLinkTrees();
  });
}

export function removeAllLinkTrees() {
  return withMutation("isDeletingAll", async () => {
    await linkTreeApi.deleteAllLinkTrees();
    selectedLinkTree.set(null);
    await loadLinkTrees();
  });
}

export function addItem(linkTreeId, payload) {
  return withMutation("isMutatingItem", async () => {
    await linkTreeApi.createLinkTreeItem(linkTreeId, payload);
    await refreshLinkTree(linkTreeId);
  });
}

export function updateItem(linkTreeId, itemId, payload) {
  return withMutation("isMutatingItem", async () => {
    await linkTreeApi.updateLinkTreeItem(linkTreeId, itemId, payload);
    await refreshLinkTree(linkTreeId);
  });
}

export function removeItem(linkTreeId, itemId) {
  return withMutation("isMutatingItem", async () => {
    await linkTreeApi.deleteLinkTreeItem(linkTreeId, itemId);
    await refreshLinkTree(linkTreeId);
  });
}
