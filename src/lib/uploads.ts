/** Rules for payment-proof and ticket attachments. Files are checked by size, declared type and magic bytes. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const allowedUploadTypes = {
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
} as const satisfies Record<string, readonly number[]>;

export type AllowedUploadType = keyof typeof allowedUploadTypes;

export type UploadCheck = { ok: true; mime: AllowedUploadType } | { ok: false; error: string };

export function checkUpload(file: { size: number; type: string; head: Uint8Array }): UploadCheck {
  if (file.size === 0) return { ok: false, error: "The file is empty." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "The file is larger than 5 MB." };
  if (!(file.type in allowedUploadTypes)) return { ok: false, error: "Please upload a PNG, JPG, WebP or PDF file." };
  const mime = file.type as AllowedUploadType;
  const magic = allowedUploadTypes[mime];
  const matches = magic.every((byte, i) => file.head[i] === byte);
  if (!matches) return { ok: false, error: "The file content does not match its type." };
  return { ok: true, mime };
}

/** Removes path parts and unusual characters from a user-supplied file name. */
export function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  const cleaned = base.replace(/[^\w.\- ]+/g, "").replace(/\s+/g, "-").slice(0, 80);
  return cleaned || "file";
}
