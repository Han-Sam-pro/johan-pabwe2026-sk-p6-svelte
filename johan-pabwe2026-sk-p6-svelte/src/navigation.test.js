import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import { currentPath, linkTo, navigate, normalizePath } from "./navigation.js";

describe("navigation - normalizePath", () => {
  it("menghapus garis miring di akhir", () => {
    expect(normalizePath("/users/")).toBe("/users");
  });

  it("membiarkan path root dan path tanpa garis miring", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("/users")).toBe("/users");
  });
});

describe("navigation - navigate dan currentPath", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    currentPath.set("/");
    vi.restoreAllMocks();
  });

  it("menambahkan entri history dan memperbarui currentPath", () => {
    navigate("/users");

    expect(window.location.pathname).toBe("/users");
    expect(get(currentPath)).toBe("/users");
  });

  it("tidak menambah history bila path sama dengan lokasi saat ini", () => {
    const pushSpy = vi.spyOn(window.history, "pushState");

    navigate("/");

    expect(pushSpy).not.toHaveBeenCalled();
    expect(get(currentPath)).toBe("/");
  });

  it("menormalkan garis miring di akhir sebelum berpindah", () => {
    navigate("/profile/");

    expect(window.location.pathname).toBe("/profile");
    expect(get(currentPath)).toBe("/profile");
  });

  it("memperbarui currentPath saat terjadi popstate", () => {
    window.history.replaceState({}, "", "/profile");

    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(get(currentPath)).toBe("/profile");
  });
});

describe("navigation - linkTo", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    currentPath.set("/");
  });

  it("mencegah perilaku default tautan dan berpindah rute", () => {
    const preventDefault = vi.fn();

    linkTo("/auth/register")({ preventDefault });

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(get(currentPath)).toBe("/auth/register");
  });
});
