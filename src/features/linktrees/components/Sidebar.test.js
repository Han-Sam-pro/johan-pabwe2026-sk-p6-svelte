import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";
import { currentPath } from "../../../navigation.js";
import Sidebar from "./Sidebar.svelte";

describe("Sidebar", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    currentPath.set("/");
  });

  it("menampilkan tiga tautan navigasi dengan Semua Link Tree sebagai menu utama", () => {
    const { getByRole } = render(Sidebar, { props: { onClose: vi.fn() } });

    expect(getByRole("link", { name: "Semua Link Tree" })).toHaveAttribute("href", "/");
    expect(getByRole("link", { name: "Pengguna" })).toHaveAttribute("href", "/users");
    expect(getByRole("link", { name: "Profil" })).toHaveAttribute("href", "/profile");
  });

  it("menandai tautan halaman aktif dengan aria-current", () => {
    currentPath.set("/users");

    const { getByRole } = render(Sidebar, { props: { onClose: vi.fn() } });

    expect(getByRole("link", { name: "Pengguna" })).toHaveAttribute("aria-current", "page");
    expect(getByRole("link", { name: "Profil" })).not.toHaveAttribute("aria-current");
  });

  it("tersembunyi bila isOpen bernilai false dan tanpa overlay", () => {
    const { container, queryByRole } = render(Sidebar, { props: { onClose: vi.fn() } });

    expect(container.querySelector("aside")).toHaveClass("-translate-x-full");
    expect(queryByRole("button", { name: "Tutup menu" })).toBeNull();
  });

  it("tampil dan menampilkan overlay bila isOpen bernilai true", async () => {
    const onClose = vi.fn();
    const { container, getByRole } = render(Sidebar, { props: { isOpen: true, onClose } });

    expect(container.querySelector("aside")).toHaveClass("translate-x-0");

    await fireEvent.click(getByRole("button", { name: "Tutup menu" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("tombol tutup di dalam sidebar memanggil onClose", async () => {
    const onClose = vi.fn();
    const { getByRole } = render(Sidebar, { props: { isOpen: true, onClose } });

    await fireEvent.click(getByRole("button", { name: "Tutup sidebar" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("berpindah rute dan menutup sidebar saat tautan diklik", async () => {
    const onClose = vi.fn();
    const { getByRole } = render(Sidebar, { props: { isOpen: true, onClose } });

    await fireEvent.click(getByRole("link", { name: "Profil" }));

    expect(get(currentPath)).toBe("/profile");
    expect(onClose).toHaveBeenCalledOnce();
  });
});
