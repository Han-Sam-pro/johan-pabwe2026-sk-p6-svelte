export const LINK_TREE_TYPES = [
  { value: "public", label: "Publik" },
  { value: "unlisted", label: "Tidak terdaftar" },
  { value: "private", label: "Privat" },
];

const LABELS = Object.fromEntries(LINK_TREE_TYPES.map((type) => [type.value, type.label]));

/** Mengembalikan label Bahasa Indonesia untuk tipe link tree. Tipe yang tidak dikenal ditampilkan apa adanya. */
export function getTypeLabel(type) {
  return LABELS[type] ?? type;
}
