<script>
  import { onMount } from "svelte";
  import { Plus } from "lucide-svelte";
  import LinkTreeCard from "../components/LinkTreeCard.svelte";
  import AddModal from "../modals/AddModal.svelte";
  import { showConfirmDialog, showErrorDialog } from "../../../helpers/toolsHelper.js";
  import {
    linkTrees,
    linkTreeStats,
    loadLinkTrees,
    mutations,
    removeAllLinkTrees,
    removeLinkTree,
    searchQuery,
    setShowOnlyMine,
    showOnlyMine,
    visibleLinkTrees,
  } from "../states/linkTreesStore.js";

  let isAddOpen = $state(false);
  let isLoading = $state(true);

  async function run(action) {
    try {
      await action();
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }

  onMount(async () => {
    await run(loadLinkTrees);
    isLoading = false;
  });

  function handleMineToggle(event) {
    run(() => setShowOnlyMine(event.currentTarget.checked));
  }

  async function handleDelete(linkTree) {
    const confirmed = await showConfirmDialog(`Hapus link tree "${linkTree.title}" beserta tautannya?`);
    if (confirmed) {
      await run(() => removeLinkTree(linkTree.id));
    }
  }

  async function handleDeleteAll() {
    const confirmed = await showConfirmDialog("Hapus semua link tree milikmu? Tindakan ini tidak dapat dibatalkan.");
    if (confirmed) {
      await run(removeAllLinkTrees);
    }
  }
</script>

<section class="mx-auto max-w-5xl space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-2xl font-bold text-slate-900">Semua Link Tree</h1>
    <div class="flex flex-wrap gap-2">
      {#if $linkTrees.length > 0}
        <button
          type="button"
          disabled={$mutations.isDeletingAll}
          class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50 disabled:opacity-60"
          onclick={handleDeleteAll}
        >
          {$mutations.isDeletingAll ? "Menghapus..." : "Hapus Semua"}
        </button>
      {/if}
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
        onclick={() => (isAddOpen = true)}
      >
        <Plus size={18} />
        Tambah Link Tree
      </button>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <p class="text-xs text-slate-500">Total link tree</p>
      <p class="text-xl font-bold text-slate-900">{$linkTreeStats.total}</p>
    </div>
    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <p class="text-xs text-slate-500">Total tautan</p>
      <p class="text-xl font-bold text-slate-900">{$linkTreeStats.totalLinks}</p>
    </div>
    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <p class="text-xs text-slate-500">Publik</p>
      <p class="text-xl font-bold text-emerald-600">{$linkTreeStats.public}</p>
    </div>
    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <p class="text-xs text-slate-500">Tidak terdaftar</p>
      <p class="text-xl font-bold text-amber-600">{$linkTreeStats.unlisted}</p>
    </div>
    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <p class="text-xs text-slate-500">Privat</p>
      <p class="text-xl font-bold text-slate-600">{$linkTreeStats.private}</p>
    </div>
  </div>

  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
    <label for="search-link-tree" class="sr-only">Cari link tree</label>
    <input
      id="search-link-tree"
      type="search"
      placeholder="Cari judul, deskripsi, atau pemilik..."
      class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:max-w-sm"
      bind:value={$searchQuery}
    />
    <label class="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        class="h-4 w-4 rounded border-slate-300 text-indigo-600"
        checked={$showOnlyMine}
        onchange={handleMineToggle}
      />
      Milik saya
    </label>
  </div>

  {#if isLoading}
    <p class="text-sm text-slate-500">Memuat link tree...</p>
  {:else if $linkTrees.length === 0}
    <p class="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
      Belum ada link tree.
    </p>
  {:else if $visibleLinkTrees.length === 0}
    <p class="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
      Tidak ada hasil untuk pencarian ini.
    </p>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each $visibleLinkTrees as linkTree (linkTree.id)}
        <LinkTreeCard {linkTree} onDelete={handleDelete} />
      {/each}
    </div>
  {/if}
</section>

{#if isAddOpen}
  <AddModal onClose={() => (isAddOpen = false)} />
{/if}
