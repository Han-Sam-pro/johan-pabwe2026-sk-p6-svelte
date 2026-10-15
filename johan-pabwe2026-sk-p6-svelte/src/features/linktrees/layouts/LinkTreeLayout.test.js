import { describe, it, expect, beforeEach } from "vitest";
import { createRawSnippet } from "svelte";
import { fireEvent, render } from "@testing-library/svelte";
import { currentPath } from "../../../navigation.js";
import LinkTreeLayout from "./LinkTreeLayout.svelte";

function renderLayout() {
  const children = createRawSnippet(() => ({
    render: () => "<p>Konten link tree</p>",
  }));
  return render(LinkTreeLayout, { props: { children } });
}

describe("LinkTreeLayout", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    currentPath.set("/");
  });

  it("menampilkan navbar, sidebar, dan isi halaman", () => {
    const { getByRole, getByText } = renderLayout();

    expect(getByRole("button", { name: "Keluar" })).toBeInTheDocument();
    expect(getByRole("navigation", { name: "Navigasi utama" })).toBeInTheDocument();
    expect(getByText("Konten link tree")).toBeInTheDocument();
  });

  it("membuka dan menutup sidebar lewat tombol menu", async () => {
    const { getByRole, queryByRole, container } = renderLayout();

    expect(queryByRole("button", { name: "Tutup menu" })).toBeNull();

    await fireEvent.click(getByRole("button", { name: "Buka menu" }));
    expect(container.querySelector("aside")).toHaveClass("translate-x-0");

    await fireEvent.click(getByRole("button", { name: "Tutup menu" }));
    expect(container.querySelector("aside")).toHaveClass("-translate-x-full");
  });
});
