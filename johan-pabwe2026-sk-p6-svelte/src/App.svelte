<script>
  import { currentPath, getRedirectPath, navigate, resolveRoute } from "./router.js";
  import { isAuthenticated } from "./features/auth/states/authStore.js";

  const route = $derived(resolveRoute($currentPath));
  const redirectPath = $derived(getRedirectPath($currentPath, $isAuthenticated));

  $effect(() => {
    if (redirectPath) {
      navigate(redirectPath);
    }
  });
</script>

{#if !redirectPath}
  {#if route.layout}
    {@const Layout = route.layout}
    {@const Page = route.page}
    <Layout>
      <Page params={route.params} />
    </Layout>
  {:else}
    {@const Page = route.page}
    <Page />
  {/if}
{/if}
