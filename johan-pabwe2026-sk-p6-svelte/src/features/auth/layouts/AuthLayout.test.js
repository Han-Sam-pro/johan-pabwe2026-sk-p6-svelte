import { describe, it, expect } from "vitest";
import { createRawSnippet } from "svelte";
import { renderWithProviders } from "../../../test-utils.js";
import AuthLayout from "./AuthLayout.svelte";

describe("AuthLayout", () => {
  it("menampilkan judul aplikasi dan isi halaman", () => {
    const children = createRawSnippet(() => ({
      render: () => "<p>Isi halaman</p>",
    }));

    const { getByRole, getByText } = renderWithProviders(AuthLayout, {
      props: { children },
    });

    expect(getByRole("heading", { name: "Delcom Link Tree" })).toBeInTheDocument();
    expect(getByText("Isi halaman")).toBeInTheDocument();
  });
});
