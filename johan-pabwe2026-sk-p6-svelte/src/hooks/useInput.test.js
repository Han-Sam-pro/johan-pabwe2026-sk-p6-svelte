import { describe, it, expect } from "vitest";
import { get } from "svelte/store";
import { useInput } from "./useInput.js";

describe("useInput", () => {
  it("memakai nilai awal kosong bila tidak diberikan", () => {
    const input = useInput();

    expect(get(input)).toBe("");
  });

  it("memakai nilai awal yang diberikan", () => {
    const input = useInput("halo");

    expect(get(input)).toBe("halo");
  });

  it("set mengubah nilai", () => {
    const input = useInput("");

    input.set("baru");

    expect(get(input)).toBe("baru");
  });

  it("reset mengembalikan nilai ke nilai awal", () => {
    const input = useInput("awal");
    input.set("berubah");

    input.reset();

    expect(get(input)).toBe("awal");
  });

  it("handleChange mengambil nilai dari event input", () => {
    const input = useInput("");
    const event = { currentTarget: { value: "dari event" } };

    input.handleChange(event);

    expect(get(input)).toBe("dari event");
  });

  it("notifikasi subscriber saat nilai berubah", () => {
    const input = useInput("a");
    const values = [];
    const unsubscribe = input.subscribe((value) => values.push(value));

    input.set("b");
    unsubscribe();

    expect(values).toEqual(["a", "b"]);
  });
});
