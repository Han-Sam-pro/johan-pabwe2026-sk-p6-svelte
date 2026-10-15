<script>
  import { onMount } from "svelte";
  import { getAssetUrl } from "../../../helpers/apiHelper.js";
  import { formatDate, showErrorDialog } from "../../../helpers/toolsHelper.js";
  import { loadUsers, users } from "../states/usersStore.js";

  let isLoading = $state(true);

  onMount(async () => {
    try {
      await loadUsers();
    } catch (error) {
      await showErrorDialog(error.message);
    } finally {
      isLoading = false;
    }
  });
</script>

<section class="mx-auto max-w-4xl space-y-6">
  <h1 class="text-2xl font-bold text-slate-900">Daftar Pengguna</h1>

  {#if isLoading}
    <p class="text-sm text-slate-500">Memuat pengguna...</p>
  {:else if $users.length === 0}
    <p class="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
      Belum ada pengguna.
    </p>
  {:else}
    <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-600">
          <tr>
            <th class="px-4 py-3 font-semibold">Nama</th>
            <th class="px-4 py-3 font-semibold">Email</th>
            <th class="px-4 py-3 font-semibold">Bergabung</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#each $users as user (user.id)}
            {@const photoUrl = getAssetUrl(user.photo)}
            <tr>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  {#if photoUrl}
                    <img src={photoUrl} alt={`Foto ${user.name}`} class="h-8 w-8 rounded-full object-cover" />
                  {:else}
                    <span class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  {/if}
                  <span class="font-medium text-slate-900">{user.name}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-600">{user.email}</td>
              <td class="px-4 py-3 text-slate-600">{formatDate(user.created_at)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>
