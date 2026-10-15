<script>
  import Modal from "./Modal.svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper.js";
  import { createLinkTree } from "../states/linkTreesStore.js";

  let { onClose } = $props();

  const title = useInput("");
  const type = useInput("public");
  let description = $state("");

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await createLinkTree({ title: $title, type: $type, description });
      await showSuccessDialog("Link tree berhasil ditambahkan.");
      onClose();
    } catch (error) {
      await showErrorDialog(error.message);
    }
  }
</script>

<Modal title="Tambah Link Tree" {onClose}>
  <form class="space-y-4" onsubmit={handleSubmit}>
    <div>
      <label for="add-title" class="mb-1 block text-sm font-medium text-slate-700">Judul</label>
      <input
        id="add-title"
        type="text"
        required
        class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        bind:value={$title}
      />
    </div>

    <div>
      <label for="add-type" class="mb-1 block text-sm font-medium text-slate-700">Tipe</label>
      <select
        id="add-type"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        bind:value={$type}
      >
        <option value="public">Publik</option>
        <option value="unlisted">Tidak terdaftar</option>
        <option value="private">Privat</option>
      </select>
    </div>

    <div>
      <label for="add-description" class="mb-1 block text-sm font-medium text-slate-700">Deskripsi</label>
      <textarea
        id="add-description"
        rows="3"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        bind:value={description}
      ></textarea>
    </div>

    <div class="flex justify-end gap-2">
      <button type="button" class="rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100" onclick={onClose}>
        Batal
      </button>
      <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">
        Simpan
      </button>
    </div>
  </form>
</Modal>
