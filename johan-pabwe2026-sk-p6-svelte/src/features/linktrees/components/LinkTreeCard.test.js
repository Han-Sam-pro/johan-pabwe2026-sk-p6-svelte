import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";
import { currentPath } from "../../../navigation.js";
import LinkTreeCard from "./LinkTreeCard.svelte";

const baseLinkTree = {
  id: 3,
  title: "Sosmed Budi",
  description: "Instagram dan X",
  type: "public",
  cover: null,
  created_at: "2026-10-15T03:00:00Z",
  author: { name: "Budi", photo: null },
  total_links: 4,
};

describe("LinkTreeCard", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    currentPath.set("/");
  });

  it("menampilkan judul, label tipe, deskripsi, pemilik, dan jumlah tautan", () => {
    const { getByRole, getByText } = render(LinkTreeCard, {
      props: { linkTree: baseLinkTree, onDelete: vi.fn() },
    });

    expect(getByRole("link", { name: "Sosmed Budi" })).toHaveAttribute("href", "/link-trees/3");
    expect(getByText("Publik")).toBeInTheDocument();
    expect(getByText("Instagram dan X")).toBeInTheDocument();
    expect(getByText("Budi")).toBeInTheDocument();
    expect(getByText("4 tautan")).toBeInTheDocument();
  });

  it("menampilkan nama pengguna cadangan bila pemilik tidak tersedia", () => {
    const { getByText } = render(LinkTreeCard, {
      props: { linkTree: { ...baseLinkTree, author: null }, onDelete: vi.fn() },
    });

    expect(getByText("Tidak diketahui")).toBeInTheDocument();
  });

  it("tidak menampilkan sampul bila link tree tidak memilikinya", () => {
    const { queryByRole } = render(LinkTreeCard, {
      props: { linkTree: baseLinkTree, onDelete: vi.fn() },
    });

    expect(queryByRole("img")).toBeNull();
  });

  it("menampilkan sampul dari server bila tersedia", () => {
    const { getByRole } = render(LinkTreeCard, {
      props: {
        linkTree: { ...baseLinkTree, cover: "https://cdn.example.com/c.jpg" },
        onDelete: vi.fn(),
      },
    });

    expect(getByRole("img", { name: "Sampul Sosmed Budi" })).toHaveAttribute("src", "https://cdn.example.com/c.jpg");
  });

  it("memanggil onDelete dengan link tree saat tombol hapus ditekan", async () => {
    const onDelete = vi.fn();
    const { getByRole } = render(LinkTreeCard, { props: { linkTree: baseLinkTree, onDelete } });

    await fireEvent.click(getByRole("button", { name: "Hapus link tree" }));

    expect(onDelete).toHaveBeenCalledWith(baseLinkTree);
  });

  it("berpindah ke halaman detail saat judul diklik", async () => {
    const { getByRole } = render(LinkTreeCard, { props: { linkTree: baseLinkTree, onDelete: vi.fn() } });

    await fireEvent.click(getByRole("link", { name: "Sosmed Budi" }));

    expect(get(currentPath)).toBe("/link-trees/3");
  });
});
