import { describe, it, expect } from "vitest";
import { currentPath, getRedirectPath, linkTo, matchPattern, navigate, resolveRoute } from "./router.js";
import AuthLayout from "./features/auth/layouts/AuthLayout.svelte";
import LoginPage from "./features/auth/pages/LoginPage.svelte";
import RegisterPage from "./features/auth/pages/RegisterPage.svelte";
import LinkTreeLayout from "./features/linktrees/layouts/LinkTreeLayout.svelte";
import HomePage from "./features/linktrees/pages/HomePage.svelte";
import DetailPage from "./features/linktrees/pages/DetailPage.svelte";
import UsersPage from "./features/users/pages/UsersPage.svelte";
import ProfilePage from "./features/users/pages/ProfilePage.svelte";
import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";

describe("router - re-export navigasi", () => {
  it("mengekspor currentPath, navigate, dan linkTo", () => {
    expect(currentPath).toBeDefined();
    expect(typeof navigate).toBe("function");
    expect(typeof linkTo).toBe("function");
  });
});

describe("router - matchPattern", () => {
  it("mengembalikan null bila path tidak cocok", () => {
    expect(matchPattern("/users", "/profile")).toBeNull();
  });

  it("mengembalikan objek kosong untuk pola tanpa parameter", () => {
    expect(matchPattern("/users", "/users")).toEqual({});
  });

  it("mengambil parameter dan men-decode nilainya", () => {
    expect(matchPattern("/link-trees/:linkTreeId", "/link-trees/42")).toEqual({ linkTreeId: "42" });
    expect(matchPattern("/link-trees/:linkTreeId", "/link-trees/a%20b")).toEqual({ linkTreeId: "a b" });
  });
});

describe("router - resolveRoute", () => {
  it.each([
    ["/auth/login", AuthLayout, LoginPage, "guest"],
    ["/auth/register", AuthLayout, RegisterPage, "guest"],
    ["/", LinkTreeLayout, HomePage, "private"],
    ["/users", LinkTreeLayout, UsersPage, "private"],
    ["/profile", LinkTreeLayout, ProfilePage, "private"],
  ])("memetakan %s ke layout dan halaman yang benar", (path, layout, page, access) => {
    const route = resolveRoute(path);

    expect(route.layout).toBe(layout);
    expect(route.page).toBe(page);
    expect(route.access).toBe(access);
    expect(route.params).toEqual({});
  });

  it("memetakan detail link tree dan mengambil linkTreeId", () => {
    const route = resolveRoute("/link-trees/7");

    expect(route.layout).toBe(LinkTreeLayout);
    expect(route.page).toBe(DetailPage);
    expect(route.access).toBe("private");
    expect(route.params).toEqual({ linkTreeId: "7" });
  });

  it("memakai path tanpa garis miring di akhir", () => {
    expect(resolveRoute("/users/").page).toBe(UsersPage);
  });

  it("mengembalikan halaman 404 untuk path yang tidak dikenal", () => {
    const route = resolveRoute("/tidak-ada");

    expect(route.layout).toBeNull();
    expect(route.page).toBe(NotFoundPage);
    expect(route.access).toBe("public");
    expect(route.params).toEqual({});
  });
});

describe("router - getRedirectPath", () => {
  it("mengarahkan pengguna tamu dari rute private ke login", () => {
    expect(getRedirectPath("/", false)).toBe("/auth/login");
    expect(getRedirectPath("/link-trees/1", false)).toBe("/auth/login");
  });

  it("mengarahkan pengguna login dari rute guest ke beranda", () => {
    expect(getRedirectPath("/auth/login", true)).toBe("/");
    expect(getRedirectPath("/auth/register", true)).toBe("/");
  });

  it("mengembalikan null bila akses sudah sesuai", () => {
    expect(getRedirectPath("/", true)).toBeNull();
    expect(getRedirectPath("/auth/login", false)).toBeNull();
    expect(getRedirectPath("/tidak-ada", false)).toBeNull();
  });
});
