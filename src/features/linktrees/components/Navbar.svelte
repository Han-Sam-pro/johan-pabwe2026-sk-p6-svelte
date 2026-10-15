<script>
  import { LogOut, Menu } from "lucide-svelte";
  import { authStore, logout } from "../../auth/states/authStore.js";
  import { showErrorDialog } from "../../../helpers/toolsHelper.js";
  import { navigate } from "../../../navigation.js";

  let { onToggleSidebar } = $props();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      await showErrorDialog(error.message);
    }
    navigate("/auth/login");
  }
</script>

<header class="sticky top-0 z-20 border-b border-slate-200 bg-white">
  <div class="flex h-14 items-center justify-between px-4">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
        aria-label="Buka menu"
        onclick={onToggleSidebar}
      >
        <Menu size={20} />
      </button>
      <span class="font-bold text-indigo-600">Delcom Link Tree</span>
    </div>

    <div class="flex items-center gap-3">
      <span class="hidden text-sm text-slate-600 sm:inline">{$authStore.user?.name ?? ""}</span>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        onclick={handleLogout}
      >
        <LogOut size={16} />
        Keluar
      </button>
    </div>
  </div>
</header>
