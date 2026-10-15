import Swal from "sweetalert2";

export function showSuccessDialog(message) {
  return Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
  });
}

export function showErrorDialog(message) {
  return Swal.fire({
    icon: "error",
    title: "Gagal",
    text: message,
  });
}

export function showWarningDialog(message) {
  return Swal.fire({
    icon: "warning",
    title: "Peringatan",
    text: message,
  });
}

/** Mengembalikan true bila pengguna menekan tombol konfirmasi. */
export function showConfirmDialog(message) {
  return Swal.fire({
    icon: "question",
    title: "Konfirmasi",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  }).then((result) => result.isConfirmed);
}

export function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
