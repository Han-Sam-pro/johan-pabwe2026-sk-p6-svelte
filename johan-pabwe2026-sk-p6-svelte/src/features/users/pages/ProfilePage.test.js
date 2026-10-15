import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { renderWithProviders } from "../../../test-utils.js";
import { authStore } from "../../auth/states/authStore.js";
import * as toolsHelper from "../../../helpers/toolsHelper.js";

const apiMock = vi.hoisted(() => ({
  getMe: vi.fn(),
  getUsers: vi.fn(),
  updateMe: vi.fn(),
  updatePassword: vi.fn(),
  updatePhoto: vi.fn(),
}));

vi.mock("../api/usersApi.js", () => apiMock);
vi.mock("../../../helpers/toolsHelper.js");

import ProfilePage from "./ProfilePage.svelte";

const profile = { id: 1, name: "Budi", email: "budi@mail.com", photo: null };

function selectFile(input, file) {
  Object.defineProperty(input, "files", { value: file ? [file] : [], configurable: true });
  return fireEvent.change(input);
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMock.getMe.mockResolvedValue(profile);
  });

  it("memuat profil dan mengisi form data diri", async () => {
    const { findByLabelText } = renderWithProviders(ProfilePage, { token: "tok" });

    expect(await findByLabelText("Nama")).toHaveValue("Budi");
    expect(await findByLabelText("Email")).toHaveValue("budi@mail.com");
    expect(apiMock.getMe).toHaveBeenCalledOnce();
  });

  it("menampilkan error bila profil gagal dimuat", async () => {
    apiMock.getMe.mockRejectedValue(new Error("Sesi berakhir"));

    renderWithProviders(ProfilePage, { token: "tok" });

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Sesi berakhir"));
  });

  it("menampilkan inisial pengguna saat belum ada foto", async () => {
    const { findByText } = renderWithProviders(ProfilePage, { token: "tok" });

    expect(await findByText("B")).toBeInTheDocument();
  });

  it("menampilkan tanda tanya bila profil belum tersedia", async () => {
    apiMock.getMe.mockReturnValue(new Promise(() => {}));

    const { getByText } = renderWithProviders(ProfilePage, { token: "tok" });

    expect(getByText("?")).toBeInTheDocument();
  });

  it("menampilkan foto profil bila tersedia", async () => {
    apiMock.getMe.mockResolvedValue({ ...profile, photo: "img/photo/1.png" });

    const { findByRole } = renderWithProviders(ProfilePage, { token: "tok" });

    expect(await findByRole("img", { name: "Foto profil" })).toHaveAttribute(
      "src",
      "http://localhost:8000/img/photo/1.png"
    );
  });

  it("menyimpan data diri lalu menampilkan pesan sukses", async () => {
    apiMock.updateMe.mockResolvedValue({ status: "success" });
    const { findByLabelText, getByRole, container } = renderWithProviders(ProfilePage, { token: "tok" });
    await findByLabelText("Nama");

    await fireEvent.input(getByRole("textbox", { name: "Nama" }), { target: { value: "Budi Santoso" } });
    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() =>
      expect(apiMock.updateMe).toHaveBeenCalledWith({ name: "Budi Santoso", email: "budi@mail.com" })
    );
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Profil berhasil diperbarui.");
  });

  it("menampilkan error bila data diri gagal disimpan", async () => {
    apiMock.updateMe.mockRejectedValue(new Error("Email sudah dipakai"));
    const { findByLabelText, container } = renderWithProviders(ProfilePage, { token: "tok" });
    await findByLabelText("Nama");

    await fireEvent.submit(container.querySelector("form"));

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai"));
  });

  it("memperingatkan bila foto belum dipilih", async () => {
    const { container } = renderWithProviders(ProfilePage, { token: "tok" });

    await fireEvent.submit(container.querySelectorAll("form")[1]);

    expect(toolsHelper.showWarningDialog).toHaveBeenCalledWith("Pilih foto terlebih dahulu.");
    expect(apiMock.updatePhoto).not.toHaveBeenCalled();
  });

  it("mengunggah foto yang dipilih lalu menampilkan pesan sukses", async () => {
    apiMock.updatePhoto.mockResolvedValue({ status: "success" });
    const file = new File(["x"], "foto.png", { type: "image/png" });
    const { getByLabelText, container } = renderWithProviders(ProfilePage, { token: "tok" });

    await selectFile(getByLabelText("Pilih foto profil"), file);
    await fireEvent.submit(container.querySelectorAll("form")[1]);

    await waitFor(() => expect(apiMock.updatePhoto).toHaveBeenCalledWith(file));
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Foto profil berhasil diubah.");
  });

  it("menampilkan error bila unggahan foto gagal", async () => {
    apiMock.updatePhoto.mockRejectedValue(new Error("Format tidak didukung"));
    const file = new File(["x"], "foto.txt", { type: "text/plain" });
    const { getByLabelText, container } = renderWithProviders(ProfilePage, { token: "tok" });

    await selectFile(getByLabelText("Pilih foto profil"), file);
    await fireEvent.submit(container.querySelectorAll("form")[1]);

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Format tidak didukung"));
  });

  it("memperingatkan bila konfirmasi kata sandi tidak sama", async () => {
    const { getByLabelText, container } = renderWithProviders(ProfilePage, { token: "tok" });

    await fireEvent.input(getByLabelText("Kata sandi saat ini"), { target: { value: "lama" } });
    await fireEvent.input(getByLabelText("Kata sandi baru"), { target: { value: "baru1" } });
    await fireEvent.input(getByLabelText("Konfirmasi kata sandi baru"), { target: { value: "baru2" } });
    await fireEvent.submit(container.querySelectorAll("form")[2]);

    expect(toolsHelper.showWarningDialog).toHaveBeenCalledWith("Konfirmasi kata sandi baru tidak sama.");
    expect(apiMock.updatePassword).not.toHaveBeenCalled();
  });

  it("mengubah kata sandi lalu mengosongkan form", async () => {
    apiMock.updatePassword.mockResolvedValue({ status: "success" });
    const { getByLabelText, container } = renderWithProviders(ProfilePage, { token: "tok" });

    await fireEvent.input(getByLabelText("Kata sandi saat ini"), { target: { value: "lama" } });
    await fireEvent.input(getByLabelText("Kata sandi baru"), { target: { value: "baru" } });
    await fireEvent.input(getByLabelText("Konfirmasi kata sandi baru"), { target: { value: "baru" } });
    await fireEvent.submit(container.querySelectorAll("form")[2]);

    await waitFor(() =>
      expect(apiMock.updatePassword).toHaveBeenCalledWith({
        password: "lama",
        newPassword: "baru",
        newPasswordConfirm: "baru",
      })
    );
    expect(getByLabelText("Kata sandi saat ini")).toHaveValue("");
    expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Kata sandi berhasil diubah.");
  });

  it("menampilkan error bila kata sandi gagal diubah", async () => {
    apiMock.updatePassword.mockRejectedValue(new Error("Kata sandi lama salah"));
    const { container } = renderWithProviders(ProfilePage, { token: "tok" });

    await fireEvent.submit(container.querySelectorAll("form")[2]);

    await waitFor(() => expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Kata sandi lama salah"));
  });

  it("memakai profil dari authStore bila sudah tersedia", async () => {
    apiMock.getMe.mockResolvedValue({ ...profile, name: "Sari", email: "sari@mail.com" });
    authStore.set({ token: "tok", user: { id: 2, name: "Sari", email: "sari@mail.com" } });

    const { findByLabelText } = renderWithProviders(ProfilePage, { token: "tok" });

    expect(await findByLabelText("Email")).toHaveValue("sari@mail.com");
  });
});
