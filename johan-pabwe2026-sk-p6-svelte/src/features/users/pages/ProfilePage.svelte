<script>
  import { onMount } from "svelte";
  import { authStore } from "../../auth/states/authStore.js";
  import { useInput } from "../../../hooks/useInput.js";
  import { getAssetUrl } from "../../../helpers/apiHelper.js";
  import { showErrorDialog, showSuccessDialog, showWarningDialog } from "../../../helpers/toolsHelper.js";
  import { changePassword, changePhoto, refreshProfile, updateProfile } from "../states/usersStore.js";

  const name = useInput("");
  const email = useInput("");
  const currentPassword = useInput("");
  const newPassword = useInput("");
  const newPasswordConfirm = useInput("");

  let photoFile = $state(null);
  let isBusy = $state(false);

  const photoUrl = $derived(getAssetUrl($authStore.user?.photo));

  // Mengisi form profil setiap kali data pengguna dimuat atau diperbarui.
  $effect(() => {
    if ($authStore.user) {
      name.set($authStore.user.name);
      email.set($authStore.user.email);
    }
  });

  onMount(async () => {
    try {
      await refreshProfile();
    } catch (error) {
      await showErrorDialog(error.message);
    }
  });

  async function submit(action) {
    isBusy = true;
    try {
      await action();
    } catch (error) {
      await showErrorDialog(error.message);
    } finally {
      isBusy = false;
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    await submit(async () => {
      await updateProfile({ name: $name, email: $email });
      await showSuccessDialog("Profil berhasil diperbarui.");
    });
  }

  function handlePhotoChange(event) {
    photoFile = event.currentTarget.files[0];
  }

  async function handlePhotoSubmit(event) {
    event.preventDefault();

    if (!photoFile) {
      await showWarningDialog("Pilih foto terlebih dahulu.");
      return;
    }

    await submit(async () => {
      await changePhoto(photoFile);
      await showSuccessDialog("Foto profil berhasil diubah.");
    });
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if ($newPassword !== $newPasswordConfirm) {
      await showWarningDialog("Konfirmasi kata sandi baru tidak sama.");
      return;
    }

    await submit(async () => {
      await changePassword({
        password: $currentPassword,
        newPassword: $newPassword,
        newPasswordConfirm: $newPasswordConfirm,
      });
      currentPassword.reset();
      newPassword.reset();
      newPasswordConfirm.reset();
      await showSuccessDialog("Kata sandi berhasil diubah.");
    });
  }
</script>

<section class="mx-auto max-w-3xl space-y-6">
  <h1 class="text-2xl font-bold text-slate-900">Profil Saya</h1>

  <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-slate-900">Data Diri</h2>
    <form class="space-y-4" onsubmit={handleProfileSubmit}>
      <div>
        <label for="profile-name" class="mb-1 block text-sm font-medium text-slate-700">Nama</label>
        <input
          id="profile-name"
          type="text"
          required
          class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          bind:value={$name}
        />
      </div>
      <div>
        <label for="profile-email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          id="profile-email"
          type="email"
          required
          class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          bind:value={$email}
        />
      </div>
      <button
        type="submit"
        disabled={isBusy}
        class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        Simpan Data
      </button>
    </form>
  </div>

  <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-slate-900">Foto Profil</h2>
    <div class="mb-4 flex items-center gap-4">
      {#if photoUrl}
        <img src={photoUrl} alt="Foto profil" class="h-16 w-16 rounded-full object-cover" />
      {:else}
        <span class="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
          {$authStore.user ? $authStore.user.name.charAt(0).toUpperCase() : "?"}
        </span>
      {/if}
    </div>
    <form class="space-y-4" onsubmit={handlePhotoSubmit}>
      <input
        id="profile-photo"
        type="file"
        accept="image/*"
        aria-label="Pilih foto profil"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        onchange={handlePhotoChange}
      />
      <button
        type="submit"
        disabled={isBusy}
        class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        Unggah Foto
      </button>
    </form>
  </div>

  <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold text-slate-900">Ubah Kata Sandi</h2>
    <form class="space-y-4" onsubmit={handlePasswordSubmit}>
      <div>
        <label for="profile-password" class="mb-1 block text-sm font-medium text-slate-700">Kata sandi saat ini</label>
        <input
          id="profile-password"
          type="password"
          required
          class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          bind:value={$currentPassword}
        />
      </div>
      <div>
        <label for="profile-new-password" class="mb-1 block text-sm font-medium text-slate-700">Kata sandi baru</label>
        <input
          id="profile-new-password"
          type="password"
          required
          class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          bind:value={$newPassword}
        />
      </div>
      <div>
        <label for="profile-new-password-confirm" class="mb-1 block text-sm font-medium text-slate-700">
          Konfirmasi kata sandi baru
        </label>
        <input
          id="profile-new-password-confirm"
          type="password"
          required
          class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          bind:value={$newPasswordConfirm}
        />
      </div>
      <button
        type="submit"
        disabled={isBusy}
        class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        Ubah Kata Sandi
      </button>
    </form>
  </div>
</section>
