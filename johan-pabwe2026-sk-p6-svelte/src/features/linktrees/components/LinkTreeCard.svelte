<script>
  import { Trash2 } from "lucide-svelte";
  import { getAssetUrl } from "../../../helpers/apiHelper.js";
  import { formatDate } from "../../../helpers/toolsHelper.js";
  import { linkTo } from "../../../navigation.js";
  import { getTypeLabel } from "../states/linkTreeTypes.js";

  let { linkTree, onDelete } = $props();

  const coverUrl = $derived(getAssetUrl(linkTree.cover));
  const detailPath = $derived(`/link-trees/${linkTree.id}`);
  const typeLabel = $derived(getTypeLabel(linkTree.type));
  const authorName = $derived(linkTree.author?.name ?? "Tidak diketahui");
</script>

<article class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
  {#if coverUrl}
    <img src={coverUrl} alt={`Sampul ${linkTree.title}`} class="h-36 w-full object-cover" />
  {/if}

  <div class="space-y-3 p-4">
    <div class="flex items-start justify-between gap-2">
      <a href={detailPath} class="min-w-0 truncate font-semibold text-slate-900 hover:text-indigo-600" onclick={linkTo(detailPath)}>
        {linkTree.title}
      </a>
      <span class="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">{typeLabel}</span>
    </div>

    <p class="line-clamp-2 text-sm text-slate-600">{linkTree.description}</p>

    <div class="flex items-center justify-between gap-2 text-xs text-slate-500">
      <span>{authorName}</span>
      <span>{`${linkTree.total_links} tautan`}</span>
    </div>

    <div class="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
      <span>{formatDate(linkTree.created_at)}</span>
      <button
        type="button"
        class="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
        aria-label="Hapus link tree"
        onclick={() => onDelete(linkTree)}
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
</article>
