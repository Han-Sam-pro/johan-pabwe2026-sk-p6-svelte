import { describe, it, expect, vi, beforeEach } from "vitest";

const fireMock = vi.hoisted(() => vi.fn());

vi.mock("sweetalert2", () => ({
  default: { fire: fireMock },
}));

import {
  formatDate,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "./toolsHelper.js";

describe("toolsHelper - dialog", () => {
  beforeEach(() => {
    fireMock.mockReset();
    fireMock.mockResolvedValue({ isConfirmed: true });
  });

  it("showSuccessDialog memanggil Swal dengan ikon success", () => {
    showSuccessDialog("Tersimpan");

    expect(fireMock).toHaveBeenCalledWith({
      icon: "success",
      title: "Berhasil",
      text: "Tersimpan",
    });
  });

  it("showErrorDialog memanggil Swal dengan ikon error", () => {
    showErrorDialog("Gagal menyimpan");

    expect(fireMock).toHaveBeenCalledWith({
      icon: "error",
      title: "Gagal",
      text: "Gagal menyimpan",
    });
  });

  it("showWarningDialog memanggil Swal dengan ikon warning", () => {
    showWarningDialog("Perhatian");

    expect(fireMock).toHaveBeenCalledWith({
      icon: "warning",
      title: "Peringatan",
      text: "Perhatian",
    });
  });

  it("showConfirmDialog mengembalikan true bila dikonfirmasi", async () => {
    fireMock.mockResolvedValue({ isConfirmed: true });

    await expect(showConfirmDialog("Hapus?")).resolves.toBe(true);
    expect(fireMock.mock.calls[0][0]).toMatchObject({
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    });
  });

  it("showConfirmDialog mengembalikan false bila dibatalkan", async () => {
    fireMock.mockResolvedValue({ isConfirmed: false });

    await expect(showConfirmDialog("Hapus?")).resolves.toBe(false);
  });
});

describe("toolsHelper - formatDate", () => {
  it("mengembalikan tanda strip bila nilai kosong", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("")).toBe("-");
  });

  it("memformat tanggal valid menjadi teks yang memuat tahun", () => {
    const formatted = formatDate("2026-10-15T03:00:00Z");

    expect(formatted).toContain("2026");
    expect(formatted).not.toBe("-");
  });
});
