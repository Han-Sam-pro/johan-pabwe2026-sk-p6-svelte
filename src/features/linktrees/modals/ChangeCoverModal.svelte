<script>
  import Modal from "./Modal.svelte";
  import { showErrorDialog, showSuccessDialog, showWarningDialog } from "../../../helpers/toolsHelper.js";
  import { changeCover } from "../states/linkTreesStore.js";

  let { linkTree, onClose } = $props();

  let file = $state(null);
  let isUploading = $state(false);

  function handleFileChange(event) {
    file = event.currentTarget.files[0];
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      await showWarningDialog("Pilih gambar sampul terlebih dahulu.");
      return;
    }

    isUploading = true;
    try {
      await changeCover(linkTree.id, file);
      await showSuccessDialog("Sampul berhasil diubah.");
      onClose();
    } catch (error) {
      await showErrorDialog(error.message);
    } finally {
      isUploading = false;
    }
  }
</script>

<Modal title="Ubah Sampul" {onClose}>
  <form class="space-y-4" onsubmit={handleSubmit}>
    <div>
      <label for="cover-file" class="mb-1 block text-sm font-medium text-slate-700">Gambar sampul</label>
      <input
        id="cover-file"
        type="file"
        accept="image/*"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        onchange={handleFileChange}
      />
    </div>

    <div class="flex justify-end gap-2">
      <button type="button" class="rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100" onclick={onClose}>
        Batal
      </button>
      <button
        type="submit"
        disabled={isUploading}
        class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {isUploading ? "Mengunggah..." : "Unggah"}
      </button>
    </div>
  </form>
</Modal>
