<script>
  import Modal from "./Modal.svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper.js";
  import { updateLinkTree } from "../states/linkTreesStore.js";

  let { linkTree, onClose } = $props();

  // Modal dipasang ulang setiap dibuka, jadi nilai awal diambil sekali dari link tree.
  // svelte-ignore state_referenced_locally
  const title = useInput(linkTree.title);
  // svelte-ignore state_referenced_locally
  const type = useInput(linkTree.type);
  // svelte-ignore state_referenced_locally
  let description = $state(linkTree.description ?? "");
  let isSaving = $state(false);

  async function handleSubmit(event) {
    event.preventDefault();
    isSaving = true;

    try {
      await updateLinkTree(linkTree.id, { title: $title, type: $type, description });
      await showSuccessDialog("Link tree berhasil diubah.");
      onClose();
    } catch (error) {
      await showErrorDialog(error.message);
    } finally {
      isSaving = false;
    }
  }
</script>

<Modal title="Ubah Link Tree" {onClose}>
  <form class="space-y-4" onsubmit={handleSubmit}>
    <div>
      <label for="change-title" class="mb-1 block text-sm font-medium text-slate-700">Judul</label>
      <input
        id="change-title"
        type="text"
        required
        class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        bind:value={$title}
      />
    </div>

    <div>
      <label for="change-type" class="mb-1 block text-sm font-medium text-slate-700">Tipe</label>
      <select
        id="change-type"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        bind:value={$type}
      >
        <option value="public">Publik</option>
        <option value="unlisted">Tidak terdaftar</option>
        <option value="private">Privat</option>
      </select>
    </div>

    <div>
      <label for="change-description" class="mb-1 block text-sm font-medium text-slate-700">Deskripsi</label>
      <textarea
        id="change-description"
        rows="3"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        bind:value={description}
      ></textarea>
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
