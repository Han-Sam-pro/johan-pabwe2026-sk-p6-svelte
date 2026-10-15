import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

const storeMock = vi.hoisted(() => ({ changeCover: vi.fn() }));

vi.mock("../states/linkTreesStore.js", () => storeMock);
vi.mock("../../../helpers/toolsHelper.js");

import * as toolsHelper from "../../../helpers/toolsHelper.js";
import ChangeCoverModal from "./ChangeCoverModal.svelte";

const linkTree = { id: 4, title: "Tautan" };

function selectFile(input, file) {
  Object.defineProperty(input, "files", { value: file ? [file] : [], configurable: true });
  return fireEvent.change(input);
}

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan input gambar dan tombol unggah", () => {
    const { getByLabelText, getByRole } = render(ChangeCoverModal, { props: { linkTree, onClose: vi.fn() } });

    expect(getByRole("dialog", { name: "Ubah Sampul" })).toBeInTheDocument();
    expect(getByLabelText("Gambar sampul")).toHaveAttribute("accept", "image/*");
    expect(getByRole("button", { name: "Unggah" })).toBeInTheDocument();
  });

  it("memperingatkan bila belum ada gambar yang dipilih", async () => {
    const { container } = render(ChangeCoverModal, { props: { linkTree, onClose: vi.fn() } });

    await fireEvent.submit(container.querySelector("form"));

    expect(toolsHelper.showWarningDialog).toHaveBeenCalledWith("Pilih gambar sampul terlebih dahulu.");
    expect(storeMock.changeCover).not.toHaveBeenCalled();
  });

  it("memperingatkan bila pemilihan file dibatalkan", async () => {
    const { getByLabelText, container } = render(ChangeCoverModal, { props: { linkTree, onClose: vi.fn() } });

    await selectFile(getByLabelText("Gambar sampul"), null);
    await fireEvent.submit(container.querySelector("form"));

    expect(toolsHelper.showWarningDialog).toHaveBeenCalled();
  });

  it("mengunggah gambar lalu menutup modal", async () => {
    storeMock.changeCover.mockResolvedValue();
    const onClose = vi.fn();
    const file = new File(["x"], "sampul.jpg", { type: "image/jpeg" });
    const { getByLabelText, container } = render(ChangeCoverModal, { props: { linkTree, onClose } });

    await selectFile(getByLabelText("Gambar sampul"), file);
    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(storeMock.changeCover).toHaveBeenCalledWith(4, file);
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Sampul berhasil diubah.");
  });

  it("menampilkan teks mengunggah saat proses berjalan", async () => {
    let resolveCover;
    storeMock.changeCover.mockReturnValue(new Promise((resolve) => (resolveCover = resolve)));
    const file = new File(["x"], "sampul.jpg", { type: "image/jpeg" });
    const { getByLabelText, getByRole, container } = render(ChangeCoverModal, {
      props: { linkTree, onClose: vi.fn() },
    });

    await selectFile(getByLabelText("Gambar sampul"), file);
    await fireEvent.submit(container.querySelector("form"));

    expect(getByRole("button", { name: "Mengunggah..." })).toBeDisabled();

    resolveCover();
    await waitFor(() => expect(getByRole("button", { name: "Unggah" })).not.toBeDisabled());
  });

  it("menampilkan dialog error bila unggahan gagal", async () => {
    storeMock.changeCover.mockRejectedValue(new Error("Ukuran terlalu besar"));
    const onClose = vi.fn();
    const file = new File(["x"], "sampul.jpg", { type: "image/jpeg" });
    const { getByLabelText, container } = render(ChangeCoverModal, { props: { linkTree, onClose } });

    await selectFile(getByLabelText("Gambar sampul"), file);
    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Ukuran terlalu besar"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol batal menutup modal", async () => {
    const onClose = vi.fn();
    const { getByRole } = render(ChangeCoverModal, { props: { linkTree, onClose } });

    await fireEvent.click(getByRole("button", { name: "Batal" }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
