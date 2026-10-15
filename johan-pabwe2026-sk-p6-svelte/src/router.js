import AuthLayout from "./features/auth/layouts/AuthLayout.svelte";
import LoginPage from "./features/auth/pages/LoginPage.svelte";
import RegisterPage from "./features/auth/pages/RegisterPage.svelte";
import LinkTreeLayout from "./features/linktrees/layouts/LinkTreeLayout.svelte";
import HomePage from "./features/linktrees/pages/HomePage.svelte";
import DetailPage from "./features/linktrees/pages/DetailPage.svelte";
import UsersPage from "./features/users/pages/UsersPage.svelte";
import ProfilePage from "./features/users/pages/ProfilePage.svelte";
import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";
import { normalizePath } from "./navigation.js";

export { currentPath, navigate, linkTo } from "./navigation.js";

/**
 * access:
 * - "guest"   : hanya untuk pengguna yang belum login
 * - "private" : hanya untuk pengguna yang sudah login
 * - "public"  : bebas diakses
 */
const routes = [
  { pattern: "/auth/login", layout: AuthLayout, page: LoginPage, access: "guest" },
  { pattern: "/auth/register", layout: AuthLayout, page: RegisterPage, access: "guest" },
  { pattern: "/", layout: LinkTreeLayout, page: HomePage, access: "private" },
  { pattern: "/link-trees/:linkTreeId", layout: LinkTreeLayout, page: DetailPage, access: "private" },
  { pattern: "/users", layout: LinkTreeLayout, page: UsersPage, access: "private" },
  { pattern: "/profile", layout: LinkTreeLayout, page: ProfilePage, access: "private" },
];

const NOT_FOUND_ROUTE = {
  layout: null,
  page: NotFoundPage,
  access: "public",
  params: {},
};

/** Mencocokkan path dengan pola seperti "/link-trees/:linkTreeId". Mengembalikan params atau null. */
export function matchPattern(pattern, path) {
  const names = [];
  const source = pattern.replace(/:(\w+)/g, (_match, name) => {
    names.push(name);
    return "([^/]+)";
  });

  const match = new RegExp(`^${source}$`).exec(path);
  if (!match) return null;

  return Object.fromEntries(names.map((name, index) => [name, decodeURIComponent(match[index + 1])]));
}

export function resolveRoute(path) {
  const normalized = normalizePath(path);

  for (const route of routes) {
    const params = matchPattern(route.pattern, normalized);
    if (params) {
      return { layout: route.layout, page: route.page, access: route.access, params };
    }
  }

  return NOT_FOUND_ROUTE;
}

/**
 * Mengembalikan path tujuan bila rute tidak sesuai dengan status login,
 * atau null bila pengguna boleh tetap berada di rute ini.
 */
export function getRedirectPath(path, isAuthenticated) {
  const { access } = resolveRoute(path);

  if (access === "private" && !isAuthenticated) return "/auth/login";
  if (access === "guest" && isAuthenticated) return "/";
  return null;
}
