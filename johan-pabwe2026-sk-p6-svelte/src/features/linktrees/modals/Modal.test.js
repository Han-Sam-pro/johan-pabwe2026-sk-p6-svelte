import { describe, it, expect, vi } from "vitest";
import { createRawSnippet } from "svelte";
import { fireEvent, render } from "@testing-library/svelte";
import Modal from "./Modal.svelte";

function renderModal(onClose = vi.fn()) {
  const children = createRawSnippet(() => ({
    render: () => "<p>Isi modal</p>",
  }));

  const result = render(Modal, { props: { title: "Judul Modal", onClose, children } });
  return { ...result, onClose };
}

describe("Modal", () => {
  it("menampilkan judul dialog dan isinya", () => {
    const { getByRole, getByText } = renderModal();

    expect(getByRole("dialog", { name: "Judul Modal" })).toBeInTheDocument();
    expect(getByText("Isi modal")).toBeInTheDocument();
  });

  it("memanggil onClose saat tombol tutup ditekan", async () => {
    const { getByRole, onClose } = renderModal();

    await fireEvent.click(getByRole("button", { name: "Tutup" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("memanggil onClose saat Escape ditekan", async () => {
    const { onClose } = renderModal();

    await fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("mengabaikan tombol selain Escape", async () => {
    const { onClose } = renderModal();

    await fireEvent.keyDown(window, { key: "Enter" });

    expect(onClose).not.toHaveBeenCalled();
  });
});
