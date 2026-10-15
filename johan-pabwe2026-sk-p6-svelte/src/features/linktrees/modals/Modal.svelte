<script>
  import { X } from "lucide-svelte";

  let { title, onClose, children } = $props();

  function handleKeydown(event) {
    if (event.key === "Escape") {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
  >
    <div class="mb-4 flex items-center justify-between">
      <h2 id="modal-title" class="text-lg font-semibold text-slate-900">{title}</h2>
      <button type="button" class="rounded-lg p-2 hover:bg-slate-100" aria-label="Tutup" onclick={onClose}>
        <X size={18} />
      </button>
    </div>
    {@render children()}
  </div>
</div>
