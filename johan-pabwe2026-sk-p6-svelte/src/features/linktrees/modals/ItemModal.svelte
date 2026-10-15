<script>
  import Modal from "./Modal.svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper.js";
  import { addItem, updateItem } from "../states/linkTreesStore.js";

  // item null berarti menambah tautan baru; item berisi berarti mengubah tautan tersebut.
  let { linkTreeId, item = null, onClose } = $props();

  // svelte-ignore state_referenced_locally
  const title = useInput(item?.title ?? "");
  // svelte-ignore state_referenced_locally
  const url = useInput(item?.url ?? "");
  let isSaving = $state(false);

  async function handleSubmit(event) {
    event.preventDefault();
    isSaving = true;

    const payload = { title: $title, url: $url };

    try {
      if (item) {
        await updateItem(linkTreeId, item.id, payload);
        await showSuccessDialog("Tautan berhasil diubah.");
      } else {
        await addItem(linkTreeId, payload);
        await showSuccessDialog("Tautan berhasil ditambahkan.");
      }
      onClose();
    } catch (error) {
      await showErrorDialog(error.message);
    } finally {
      isSaving = false;
    }
  }
</script>

<Modal title={item ? "Ubah Tautan" : "Tambah Tautan"} {onClose}>
  <form class="space-y-4" onsubmit={handleSubmit}>
    <div>
      <label for="item-title" class="mb-1 block text-sm font-medium text-slate-700">Judul tautan</label>
      <input
        id="item-title"
        type="text"
        required
        class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        bind:value={$title}
      />
    </div>

    <div>
      <label for="item-url" class="mb-1 block text-sm font-medium text-slate-700">URL</label>
      <input
        id="item-url"
        type="url"
        required
        placeholder="https://"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        bind:value={$url}
      />
    </div>

    <div class="flex justify-end gap-2">
      <button type="button" class="rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100" onclick={onClose}>
        Batal
      </button>
      <button
        type="submit"
        disabled={isSaving}
        class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {isSaving ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  </form>
</Modal>
