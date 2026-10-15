import { writable } from "svelte/store";

/** Menghapus garis miring di akhir path, kecuali path root "/". */
export function normalizePath(path) {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

export const currentPath = writable(normalizePath(window.location.pathname));

export function navigate(path) {
  const target = normalizePath(path);

  if (normalizePath(window.location.pathname) !== target) {
    window.history.pushState({}, "", target);
  }

  currentPath.set(target);
}

/** Handler klik tautan: mencegah reload penuh lalu berpindah rute lewat History API. */
export function linkTo(path) {
  return (event) => {
    event.preventDefault();
    navigate(path);
  };
}

window.addEventListener("popstate", () => {
  currentPath.set(normalizePath(window.location.pathname));
});
