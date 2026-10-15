import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

const storeMock = vi.hoisted(() => ({
  addItem: vi.fn(),
  updateItem: vi.fn(),
}));

vi.mock("../states/linkTreesStore.js", () => storeMock);
vi.mock("../../../helpers/toolsHelper.js");

import * as toolsHelper from "../../../helpers/toolsHelper.js";
import ItemModal from "./ItemModal.svelte";

const item = { id: 21, link_tree_id: 5, title: "Blog", url: "https://blog.id" };

describe("ItemModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan form kosong untuk tautan baru", () => {
    const { getByRole, getByLabelText } = render(ItemModal, { props: { linkTreeId: 5, onClose: vi.fn() } });

    expect(getByRole("dialog", { name: "Tambah Tautan" })).toBeInTheDocument();
    expect(getByLabelText("Judul tautan")).toHaveValue("");
    expect(getByLabelText("URL")).toHaveValue("");
  });

  it("mengisi form dengan data tautan saat mengubah", () => {
    const { getByRole, getByLabelText } = render(ItemModal, {
      props: { linkTreeId: 5, item, onClose: vi.fn() },
    });

    expect(getByRole("dialog", { name: "Ubah Tautan" })).toBeInTheDocument();
    expect(getByLabelText("Judul tautan")).toHaveValue("Blog");
    expect(getByLabelText("URL")).toHaveValue("https://blog.id");
  });

  it("menambah tautan baru lalu menutup modal", async () => {
    storeMock.addItem.mockResolvedValue();
    const onClose = vi.fn();
    const { getByLabelText, container } = render(ItemModal, { props: { linkTreeId: 5, onClose } });

    await fireEvent.input(getByLabelText("Judul tautan"), { target: { value: "Toko" } });
    await fireEvent.input(getByLabelText("URL"), { target: { value: "https://toko.id" } });
    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(storeMock.addItem).toHaveBeenCalledWith(5, { title: "Toko", url: "https://toko.id" });
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Tautan berhasil ditambahkan.");
  });

  it("mengubah tautan yang ada lalu menutup modal", async () => {
    storeMock.updateItem.mockResolvedValue();
    const onClose = vi.fn();
    const { getByLabelText, container } = render(ItemModal, { props: { linkTreeId: 5, item, onClose } });

    await fireEvent.input(getByLabelText("Judul tautan"), { target: { value: "Blog baru" } });
    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(storeMock.updateItem).toHaveBeenCalledWith(5, 21, { title: "Blog baru", url: "https://blog.id" });
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Tautan berhasil diubah.");
  });

  it("menampilkan teks menyimpan saat permintaan berjalan", async () => {
    let resolveAdd;
    storeMock.addItem.mockReturnValue(new Promise((resolve) => (resolveAdd = resolve)));
    const { getByRole, container } = render(ItemModal, { props: { linkTreeId: 5, onClose: vi.fn() } });

    await fireEvent.submit(container.querySelector("form"));

    expect(getByRole("button", { name: "Menyimpan..." })).toBeDisabled();

    resolveAdd();
    await waitFor(() => expect(getByRole("button", { name: "Simpan" })).not.toBeDisabled());
  });

  it("menampilkan dialog error bila penyimpanan gagal", async () => {
    storeMock.updateItem.mockRejectedValue(new Error("URL tidak valid"));
    const onClose = vi.fn();
    const { container } = render(ItemModal, { props: { linkTreeId: 5, item, onClose } });

    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("URL tidak valid"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol batal menutup modal", async () => {
    const onClose = vi.fn();
    const { getByRole } = render(ItemModal, { props: { linkTreeId: 5, onClose } });

    await fireEvent.click(getByRole("button", { name: "Batal" }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
