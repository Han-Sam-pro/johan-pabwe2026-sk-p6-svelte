import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

const authMock = vi.hoisted(() => ({ logout: vi.fn() }));

vi.mock("../../auth/states/authStore.js", async () => {
  const { writable } = await import("svelte/store");
  return {
    authStore: writable({ token: "tok", user: null }),
    logout: authMock.logout,
  };
});

vi.mock("../../../helpers/toolsHelper.js");

import { authStore } from "../../auth/states/authStore.js";
import * as toolsHelper from "../../../helpers/toolsHelper.js";
import { currentPath } from "../../../navigation.js";
import Navbar from "./Navbar.svelte";

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.set({ token: "tok", user: null });
    window.history.replaceState({}, "", "/");
    currentPath.set("/");
  });

  it("menampilkan nama aplikasi dan tombol keluar", () => {
    const { getByText, getByRole } = render(Navbar, { props: { onToggleSidebar: vi.fn() } });

    expect(getByText("Delcom Link Tree")).toBeInTheDocument();
    expect(getByRole("button", { name: "Keluar" })).toBeInTheDocument();
  });

  it("menampilkan nama pengguna bila profil sudah dimuat", () => {
    authStore.set({ token: "tok", user: { name: "Budi" } });

    const { getByText } = render(Navbar, { props: { onToggleSidebar: vi.fn() } });

    expect(getByText("Budi")).toBeInTheDocument();
  });

  it("memanggil onToggleSidebar saat tombol menu ditekan", async () => {
    const onToggleSidebar = vi.fn();
    const { getByRole } = render(Navbar, { props: { onToggleSidebar } });

    await fireEvent.click(getByRole("button", { name: "Buka menu" }));

    expect(onToggleSidebar).toHaveBeenCalledOnce();
  });

  it("keluar dengan sukses lalu berpindah ke halaman login", async () => {
    authMock.logout.mockResolvedValue({ status: "success" });
    const { getByRole } = render(Navbar, { props: { onToggleSidebar: vi.fn() } });

    await fireEvent.click(getByRole("button", { name: "Keluar" }));

    await waitFor(() => expect(get(currentPath)).toBe("/auth/login"));
    expect(toolsHelper.showErrorDialog).not.toHaveBeenCalled();
  });

  it("menampilkan error bila keluar gagal tetapi tetap berpindah ke halaman login", async () => {
    authMock.logout.mockRejectedValue(new Error("Jaringan bermasalah"));
    const { getByRole } = render(Navbar, { props: { onToggleSidebar: vi.fn() } });

    await fireEvent.click(getByRole("button", { name: "Keluar" }));

    await waitFor(() => expect(get(currentPath)).toBe("/auth/login"));
    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Jaringan bermasalah");
  });
});
