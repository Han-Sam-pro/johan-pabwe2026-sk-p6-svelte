<script>
  import Navbar from "../components/Navbar.svelte";
  import Sidebar from "../components/Sidebar.svelte";

  let { children } = $props();

  let isSidebarOpen = $state(false);
</script>

<div class="min-h-screen">
  <Navbar onToggleSidebar={() => (isSidebarOpen = !isSidebarOpen)} />
  <Sidebar isOpen={isSidebarOpen} onClose={() => (isSidebarOpen = false)} />

  <main class="p-4 sm:p-6 lg:pl-72">
    {@render children()}
  </main>
</div>
