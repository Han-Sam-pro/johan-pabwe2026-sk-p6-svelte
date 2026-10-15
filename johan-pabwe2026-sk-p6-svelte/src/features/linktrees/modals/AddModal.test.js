import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

const storeMock = vi.hoisted(() => ({ createLinkTree: vi.fn() }));

vi.mock("../states/linkTreesStore.js", () => storeMock);
vi.mock("../../../helpers/toolsHelper.js");

import * as toolsHelper from "../../../helpers/toolsHelper.js";
import AddModal from "./AddModal.svelte";

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan form dengan pilihan tipe", () => {
    const { getByRole, getByLabelText } = render(AddModal, { props: { onClose: vi.fn() } });

    expect(getByRole("dialog", { name: "Tambah Link Tree" })).toBeInTheDocument();
    expect(getByLabelText("Tipe")).toHaveValue("public");
    expect(getByRole("option", { name: "Privat" })).toBeInTheDocument();
  });

  it("menyimpan link tree dengan tipe yang dipilih lalu menutup modal", async () => {
    storeMock.createLinkTree.mockResolvedValue(1);
    const onClose = vi.fn();
    const { getByLabelText, getByRole, container } = render(AddModal, { props: { onClose } });

    await fireEvent.input(getByLabelText("Judul"), { target: { value: "Portofolio" } });
    await fireEvent.change(getByLabelText("Tipe"), { target: { value: "private" } });
    await fireEvent.input(getByLabelText("Deskripsi"), { target: { value: "Karya" } });
    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(storeMock.createLinkTree).toHaveBeenCalledWith({
      title: "Portofolio",
      type: "private",
      description: "Karya",
    });
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Link tree berhasil ditambahkan.");
  });

  it("menampilkan dialog error dan tetap terbuka bila gagal", async () => {
    storeMock.createLinkTree.mockRejectedValue(new Error("Judul sudah ada"));
    const onClose = vi.fn();
    const { container } = render(AddModal, { props: { onClose } });

    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Judul sudah ada"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol batal menutup modal tanpa menyimpan", async () => {
    const onClose = vi.fn();
    const { getByRole } = render(AddModal, { props: { onClose } });

    await fireEvent.click(getByRole("button", { name: "Batal" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(storeMock.createLinkTree).not.toHaveBeenCalled();
  });
});
