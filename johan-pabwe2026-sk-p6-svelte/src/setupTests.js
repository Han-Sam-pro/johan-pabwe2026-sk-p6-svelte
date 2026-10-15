import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/svelte";

globalThis.DELCOM_BASEURL = "http://localhost:8000/api/v1";

// Ikon lucide-svelte tidak perlu dirender sungguhan di pengujian.
// Setiap nama ikon dikembalikan sebagai komponen kosong.
vi.mock("lucide-svelte", async (importOriginal) => {
  const actual = await importOriginal();
  const EmptyIcon = () => {};
  return Object.fromEntries(Object.keys(actual).map((name) => [name, EmptyIcon]));
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
