import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ApiError,
  apiFetch,
  buildUrl,
  getAccessToken,
  getAssetUrl,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper.js";

function mockFetchResponse({ ok = true, status = 200, statusText = "OK", json = {} } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    statusText,
    json: () => Promise.resolve(json),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("apiHelper - token", () => {
  it("menyimpan, membaca, dan menghapus token di localStorage", () => {
    expect(getAccessToken()).toBeNull();

    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");

    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("apiHelper - ApiError", () => {
  it("menyimpan status dan data validasi", () => {
    const error = new ApiError("Data tidak valid", { status: 422, data: { email: ["wajib"] } });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
    expect(error.message).toBe("Data tidak valid");
    expect(error.status).toBe(422);
    expect(error.data).toEqual({ email: ["wajib"] });
  });

  it("membiarkan status dan data kosong bila tidak diberikan", () => {
    const error = new ApiError("Gagal");

    expect(error.status).toBeUndefined();
    expect(error.data).toBeUndefined();
  });
});

describe("apiHelper - buildUrl", () => {
  it("menggabungkan base URL dengan path tanpa query", () => {
    expect(buildUrl("/link-trees")).toBe("http://localhost:8000/api/v1/link-trees");
  });

  it("menambahkan query dan melewati nilai null/undefined", () => {
    const url = new URL(buildUrl("/link-trees", { is_finished: 1, empty: null, missing: undefined }));

    expect(url.searchParams.get("is_finished")).toBe("1");
    expect(url.searchParams.has("empty")).toBe(false);
    expect(url.searchParams.has("missing")).toBe(false);
  });
});

describe("apiHelper - getAssetUrl", () => {
  it("mengembalikan null bila path kosong", () => {
    expect(getAssetUrl(null)).toBeNull();
    expect(getAssetUrl("")).toBeNull();
  });

  it("mengembalikan URL absolut apa adanya", () => {
    expect(getAssetUrl("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
  });

  it("menggabungkan path relatif dengan origin API", () => {
    expect(getAssetUrl("img/cover/1.png")).toBe("http://localhost:8000/img/cover/1.png");
    expect(getAssetUrl("/img/cover/1.png")).toBe("http://localhost:8000/img/cover/1.png");
  });
});

describe("apiHelper - apiFetch", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("mengirim GET dengan header Accept dan mengembalikan JSON", async () => {
    const fetchMock = mockFetchResponse({ json: { status: "success", data: { ok: true } } });

    const result = await apiFetch("/link-trees");

    expect(result).toEqual({ status: "success", data: { ok: true } });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8000/api/v1/link-trees");
    expect(options.method).toBe("GET");
    expect(options.headers).toEqual({ Accept: "application/json" });
    expect(options.body).toBeUndefined();
  });

  it("menyertakan Authorization bila token tersedia", async () => {
    putAccessToken("token-123");
    const fetchMock = mockFetchResponse({ json: { status: "success" } });

    await apiFetch("/users/me");

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer token-123");
  });

  it("tidak menyertakan Authorization bila auth dimatikan", async () => {
    putAccessToken("token-123");
    const fetchMock = mockFetchResponse({ json: { status: "success" } });

    await apiFetch("/auth/login", { method: "POST", auth: false });

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("tidak menyertakan Authorization bila token belum ada", async () => {
    const fetchMock = mockFetchResponse({ json: { status: "success" } });

    await apiFetch("/link-trees");

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("mengirim body JSON dengan Content-Type", async () => {
    const fetchMock = mockFetchResponse({ json: { status: "success" } });

    await apiFetch("/link-trees", { method: "POST", body: { title: "Tautan" } });

    const options = fetchMock.mock.calls[0][1];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(JSON.stringify({ title: "Tautan" }));
  });

  it("mengirim formData tanpa mengubah Content-Type", async () => {
    const fetchMock = mockFetchResponse({ json: { status: "success" } });
    const formData = new FormData();
    formData.append("cover", "file");

    await apiFetch("/link-trees/1/cover", { method: "POST", formData });

    const options = fetchMock.mock.calls[0][1];
    expect(options.body).toBe(formData);
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  it("meneruskan query string ke URL", async () => {
    const fetchMock = mockFetchResponse({ json: { status: "success" } });

    await apiFetch("/link-trees", { query: { is_finished: 0 } });

    expect(fetchMock.mock.calls[0][0]).toContain("is_finished=0");
  });

  it("melempar ApiError dengan pesan dan data dari respons gagal", async () => {
    mockFetchResponse({
      ok: false,
      status: 422,
      statusText: "Unprocessable",
      json: { status: "fail", message: "Data tidak valid", data: { title: ["wajib"] } },
    });

    const promise = apiFetch("/link-trees", { method: "POST", body: {} });

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      message: "Data tidak valid",
      status: 422,
      data: { title: ["wajib"] },
    });
  });

  it("memakai statusText bila respons tidak memiliki message", async () => {
    mockFetchResponse({ ok: false, status: 500, statusText: "Server Error", json: {} });

    await expect(apiFetch("/link-trees")).rejects.toMatchObject({
      message: "Server Error",
      status: 500,
    });
  });

  it("memakai pesan default bila message dan statusText kosong", async () => {
    mockFetchResponse({ ok: false, status: 500, statusText: "", json: {} });

    await expect(apiFetch("/link-trees")).rejects.toMatchObject({
      message: "Terjadi kesalahan",
    });
  });

  it("melempar error bila respons tidak berisi JSON valid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.reject(new SyntaxError("bad json")),
      })
    );

    await expect(apiFetch("/link-trees")).rejects.toMatchObject({
      message: "OK",
    });
  });

  it("melempar error bila status respons success tetapi ok false", async () => {
    mockFetchResponse({ ok: false, status: 404, json: { status: "success", message: "Tidak ditemukan" } });

    await expect(apiFetch("/link-trees/9")).rejects.toMatchObject({ message: "Tidak ditemukan" });
  });
});
