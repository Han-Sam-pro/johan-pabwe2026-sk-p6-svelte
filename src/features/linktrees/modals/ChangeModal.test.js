import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

const storeMock = vi.hoisted(() => ({ updateLinkTree: vi.fn() }));

vi.mock("../states/linkTreesStore.js", () => storeMock);
vi.mock("../../../helpers/toolsHelper.js");

import * as toolsHelper from "../../../helpers/toolsHelper.js";
import ChangeModal from "./ChangeModal.svelte";

const linkTree = { id: 6, title: "Lama", type: "unlisted", description: "Deskripsi lama" };

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mengisi form dengan data link tree yang ada", () => {
    const { getByLabelText, getByRole } = render(ChangeModal, { props: { linkTree, onClose: vi.fn() } });

    expect(getByRole("dialog", { name: "Ubah Link Tree" })).toBeInTheDocument();
    expect(getByLabelText("Judul")).toHaveValue("Lama");
    expect(getByLabelText("Tipe")).toHaveValue("unlisted");
    expect(getByLabelText("Deskripsi")).toHaveValue("Deskripsi lama");
  });

  it("mengisi deskripsi kosong bila link tree tidak memilikinya", () => {
    const { getByLabelText } = render(ChangeModal, {
      props: { linkTree: { ...linkTree, description: null }, onClose: vi.fn() },
    });

    expect(getByLabelText("Deskripsi")).toHaveValue("");
  });

  it("menyimpan perubahan lalu menutup modal", async () => {
    storeMock.updateLinkTree.mockResolvedValue();
    const onClose = vi.fn();
    const { getByLabelText, container } = render(ChangeModal, { props: { linkTree, onClose } });

    await fireEvent.input(getByLabelText("Judul"), { target: { value: "Baru" } });
    await fireEvent.change(getByLabelText("Tipe"), { target: { value: "public" } });
    await fireEvent.input(getByLabelText("Deskripsi"), { target: { value: "Deskripsi baru" } });
    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(storeMock.updateLinkTree).toHaveBeenCalledWith(6, {
      title: "Baru",
      type: "public",
      description: "Deskripsi baru",
    });
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Link tree berhasil diubah.");
  });

  it("menampilkan teks menyimpan saat permintaan berjalan", async () => {
    let resolveUpdate;
    storeMock.updateLinkTree.mockReturnValue(new Promise((resolve) => (resolveUpdate = resolve)));
    const { getByRole, container } = render(ChangeModal, { props: { linkTree, onClose: vi.fn() } });

    await fireEvent.submit(container.querySelector("form"));

    expect(getByRole("button", { name: "Menyimpan..." })).toBeDisabled();

    resolveUpdate();
    await waitFor(() => expect(getByRole("button", { name: "Simpan" })).not.toBeDisabled());
  });

  it("menampilkan dialog error bila gagal", async () => {
    storeMock.updateLinkTree.mockRejectedValue(new Error("Tidak diizinkan"));
    const onClose = vi.fn();
    const { container } = render(ChangeModal, { props: { linkTree, onClose } });

    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Tidak diizinkan"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol batal menutup modal", async () => {
    const onClose = vi.fn();
    const { getByRole } = render(ChangeModal, { props: { linkTree, onClose } });

    await fireEvent.click(getByRole("button", { name: "Batal" }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
