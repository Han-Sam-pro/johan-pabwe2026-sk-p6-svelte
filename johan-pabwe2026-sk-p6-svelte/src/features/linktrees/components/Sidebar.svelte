<script>
  import { Link, UserRound, Users, X } from "lucide-svelte";
  import { currentPath, linkTo } from "../../../navigation.js";

  let { isOpen = false, onClose } = $props();

  const links = [
    { href: "/", label: "Semua Link Tree", icon: Link },
    { href: "/users", label: "Pengguna", icon: Users },
    { href: "/profile", label: "Profil", icon: UserRound },
  ];

  function openLink(event, href) {
    linkTo(href)(event);
    onClose();
  }
</script>

{#if isOpen}
  <button
    type="button"
    class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
    aria-label="Tutup menu"
    onclick={onClose}
  ></button>
{/if}

<aside
  class="fixed inset-y-14 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform lg:translate-x-0 {isOpen
    ? 'translate-x-0'
    : '-translate-x-full'}"
>
  <div class="flex items-center justify-end p-2 lg:hidden">
    <button type="button" class="rounded-lg p-2 hover:bg-slate-100" aria-label="Tutup sidebar" onclick={onClose}>
      <X size={18} />
    </button>
  </div>

  <nav class="space-y-1 p-4" aria-label="Navigasi utama">
    {#each links as link (link.href)}
      {@const Icon = link.icon}
      <a
        href={link.href}
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium {$currentPath === link.href
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-700 hover:bg-slate-100'}"
        aria-current={$currentPath === link.href ? "page" : undefined}
        onclick={(event) => openLink(event, link.href)}
      >
        <Icon size={18} />
        <span>{link.label}</span>
      </a>
    {/each}
  </nav>
</aside>
