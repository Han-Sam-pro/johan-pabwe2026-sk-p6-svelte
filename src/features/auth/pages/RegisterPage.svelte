<script>
  import { UserPlus } from "lucide-svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper.js";
  import { linkTo, navigate } from "../../../navigation.js";
  import { register } from "../states/authStore.js";

  const name = useInput("");
  const email = useInput("");
  const password = useInput("");
  let isSubmitting = $state(false);

  async function handleSubmit(event) {
    event.preventDefault();
    isSubmitting = true;

    try {
      await register({ name: $name, email: $email, password: $password });
      await showSuccessDialog("Pendaftaran berhasil. Silakan masuk.");
      name.reset();
      email.reset();
      password.reset();
      navigate("/auth/login");
    } catch (error) {
      await showErrorDialog(error.message);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<h2 class="text-lg font-semibold text-slate-900 mb-4">Daftar Akun</h2>

<form class="space-y-4" onsubmit={handleSubmit}>
  <div>
    <label for="register-name" class="block text-sm font-medium text-slate-700 mb-1">Nama</label>
    <input
      id="register-name"
      type="text"
      required
      class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      bind:value={$name}
    />
  </div>

  <div>
    <label for="register-email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
    <input
      id="register-email"
      type="email"
      required
      class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      bind:value={$email}
    />
  </div>

  <div>
    <label for="register-password" class="block text-sm font-medium text-slate-700 mb-1">Kata sandi</label>
    <input
      id="register-password"
      type="password"
      required
      class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      bind:value={$password}
    />
  </div>

  <button
    type="submit"
    disabled={isSubmitting}
    class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
  >
    <UserPlus size={18} />
    {isSubmitting ? "Memproses..." : "Daftar"}
  </button>
</form>

<p class="mt-6 text-center text-sm text-slate-600">
  Sudah punya akun?
  <a href="/auth/login" class="font-semibold text-indigo-600 hover:underline" onclick={linkTo("/auth/login")}>
    Masuk
  </a>
</p>
