import { describe, expect, it } from "vitest";
import { checkUpload, MAX_UPLOAD_BYTES, safeFileName } from "@/lib/uploads";

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

describe("checkUpload", () => {
  it("accepts a real PNG and PDF", () => {
    expect(checkUpload({ size: 1000, type: "image/png", head: png })).toEqual({ ok: true, mime: "image/png" });
    expect(checkUpload({ size: 1000, type: "application/pdf", head: pdf })).toEqual({ ok: true, mime: "application/pdf" });
  });
  it("rejects a file whose content doesn't match its type", () => {
    expect(checkUpload({ size: 1000, type: "image/png", head: pdf }).ok).toBe(false);
  });
  it("rejects types outside the allow-list", () => {
    expect(checkUpload({ size: 1000, type: "text/html", head: new Uint8Array([0x3c]) }).ok).toBe(false);
    expect(checkUpload({ size: 1000, type: "image/svg+xml", head: new Uint8Array([0x3c]) }).ok).toBe(false);
  });
  it("rejects empty and oversized files", () => {
    expect(checkUpload({ size: 0, type: "image/png", head: png }).ok).toBe(false);
    expect(checkUpload({ size: MAX_UPLOAD_BYTES + 1, type: "image/png", head: png }).ok).toBe(false);
  });
});

describe("safeFileName", () => {
  it("strips paths and odd characters", () => {
    expect(safeFileName("../../etc/passwd")).toBe("passwd");
    expect(safeFileName("C:\\Users\\me\\receipt (1).png")).toBe("receipt-1.png");
    expect(safeFileName("<script>.pdf")).toBe("script.pdf");
  });
  it("never returns an empty name", () => {
    expect(safeFileName("///")).toBe("file");
  });
});
