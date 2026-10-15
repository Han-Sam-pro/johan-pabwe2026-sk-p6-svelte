<script>
  import { ArrowLeft, ExternalLink, ImagePlus, Pencil, Plus, Trash2 } from "lucide-svelte";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ItemModal from "../modals/ItemModal.svelte";
  import { getAssetUrl } from "../../../helpers/apiHelper.js";
  import { formatDate, showConfirmDialog, showErrorDialog } from "../../../helpers/toolsHelper.js";
  import { linkTo, navigate } from "../../../navigation.js";
  import { getTypeLabel } from "../states/linkTreeTypes.js";
  import {
    loadLinkTree,
    removeItem,
    removeLinkTree,
    selectedLinkTree,
  } from "../states/linkTreesStore.js";

  let { params } = $props();

  let activeModal = $state(null);
  let editingItem = $state(null);

  const coverUrl = $derived(getAssetUrl($selectedLinkTree?.cover));

  async function run(action) {
    try {
      await action();
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }

  async function fetchDetail(linkTreeId) {
    try {
      await loadLinkTree(linkTreeId);
    } catch (error) {
      await showErrorDialog(error.message);
      navigate("/");
    }
  }

  $effect(() => {
    fetchDetail(params.linkTreeId);
  });

  function closeModal() {
    activeModal = null;
    editingItem = null;
  }

  function openAddItem() {
    editingItem = null;
    activeModal = "item";
  }

  function openEditItem(item) {
    editingItem = item;
    activeModal = "item";
  }

  async function handleDelete() {
    const confirmed = await showConfirmDialog(`Hapus link tree "${$selectedLinkTree.title}" beserta tautannya?`);
    if (confirmed) {
      await run(async () => {
        await removeLinkTree($selectedLinkTree.id);
        navigate("/");
      });
    }
  }

  async function handleDeleteItem(item) {
    const confirmed = await showConfirmDialog(`Hapus tautan "${item.title}"?`);
    if (confirmed) {
      await run(() => removeItem($selectedLinkTree.id, item.id));
    }
  }
</script>

<section class="mx-auto max-w-3xl space-y-6">
  <a
    href="/"
    class="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
    onclick={linkTo("/")}
  >
    <ArrowLeft size={16} />
    Kembali ke daftar
  </a>

  {#if $selectedLinkTree}
    {@const linkTree = $selectedLinkTree}
    <article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {#if coverUrl}
        <img src={coverUrl} alt={`Sampul ${linkTree.title}`} class="max-h-72 w-full object-cover" />
      {/if}

      <div class="space-y-5 p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h1 class="text-2xl font-bold text-slate-900">{linkTree.title}</h1>
            <p class="text-sm text-slate-500">{`Dibuat oleh ${linkTree.author.name} · ${formatDate(linkTree.created_at)}`}</p>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {getTypeLabel(linkTree.type)}
          </span>
        </div>

        <p class="whitespace-pre-line text-slate-700">{linkTree.description}</p>

        <div class="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
            onclick={() => (activeModal = "change")}
          >
            <Pencil size={16} />
            Ubah data
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
            onclick={() => (activeModal = "cover")}
          >
            <ImagePlus size={16} />
            Ubah sampul
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            onclick={handleDelete}
          >
            <Trash2 size={16} />
            Hapus
          </button>
        </div>
      </div>
    </article>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900">Tautan</h2>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          onclick={openAddItem}
        >
          <Plus size={16} />
          Tambah tautan
        </button>
      </div>

      {#if linkTree.items.length === 0}
        <p class="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
          Belum ada tautan.
        </p>
      {:else}
        <ul class="space-y-3">
          {#each linkTree.items as item (item.id)}
            <li class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div class="min-w-0 flex-1">
                <p class="truncate font-semibold text-slate-900">{item.title}</p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex max-w-full items-center gap-1 truncate text-sm text-indigo-600 hover:underline"
                >
                  <ExternalLink size={14} />
                  <span class="truncate">{item.url}</span>
                </a>
              </div>
              <button
                type="button"
                class="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label={`Ubah tautan ${item.title}`}
                onclick={() => openEditItem(item)}
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                class="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                aria-label={`Hapus tautan ${item.title}`}
                onclick={() => handleDeleteItem(item)}
              >
                <Trash2 size={16} />
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {:else}
    <p class="text-sm text-slate-500">Memuat link tree...</p>
  {/if}
</section>

{#if activeModal === "change" && $selectedLinkTree}
  <ChangeModal linkTree={$selectedLinkTree} onClose={closeModal} />
{/if}

{#if activeModal === "cover" && $selectedLinkTree}
  <ChangeCoverModal linkTree={$selectedLinkTree} onClose={closeModal} />
{/if}

{#if activeModal === "item" && $selectedLinkTree}
  <ItemModal linkTreeId={$selectedLinkTree.id} item={editingItem} onClose={closeModal} />
{/if}
