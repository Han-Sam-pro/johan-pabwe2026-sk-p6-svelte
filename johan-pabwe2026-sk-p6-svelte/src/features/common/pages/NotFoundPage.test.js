import { describe, it, expect, beforeEach } from "vitest";
import { fireEvent } from "@testing-library/svelte";
import { get } from "svelte/store";
import { renderWithProviders } from "../../../test-utils.js";
import { currentPath } from "../../../navigation.js";
import NotFoundPage from "./NotFoundPage.svelte";

describe("NotFoundPage", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/tidak-ada");
    currentPath.set("/tidak-ada");
  });

  it("menampilkan kode dan pesan 404", () => {
    const { getByRole, getByText } = renderWithProviders(NotFoundPage);

    expect(getByText("404")).toBeInTheDocument();
    expect(getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeInTheDocument();
  });

  it("tautan kembali ke beranda berpindah rute", async () => {
    const { getByRole } = renderWithProviders(NotFoundPage);

    await fireEvent.click(getByRole("link", { name: "Kembali ke beranda" }));

    expect(get(currentPath)).toBe("/");
  });
});
