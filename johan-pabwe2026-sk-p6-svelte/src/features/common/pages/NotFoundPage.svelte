<script>
  import { linkTo } from "../../../navigation.js";
</script>

<section class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
  <p class="text-6xl font-extrabold text-indigo-600">404</p>
  <h1 class="text-2xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
  <p class="text-slate-500">Alamat yang kamu tuju tidak tersedia.</p>
  <a href="/" class="font-semibold text-indigo-600 hover:underline" onclick={linkTo("/")}>Kembali ke beranda</a>
</section>
