import { describe, it, expect } from "vitest";
import { LINK_TREE_TYPES, getTypeLabel } from "./linkTreeTypes.js";

describe("linkTreeTypes", () => {
  it("memiliki tiga tipe dengan label Bahasa Indonesia", () => {
    expect(LINK_TREE_TYPES.map((type) => type.value)).toEqual(["public", "unlisted", "private"]);
  });

  it("mengembalikan label untuk tipe yang dikenal", () => {
    expect(getTypeLabel("public")).toBe("Publik");
    expect(getTypeLabel("unlisted")).toBe("Tidak terdaftar");
    expect(getTypeLabel("private")).toBe("Privat");
  });

  it("mengembalikan tipe apa adanya bila tidak dikenal", () => {
    expect(getTypeLabel("lainnya")).toBe("lainnya");
  });
});
