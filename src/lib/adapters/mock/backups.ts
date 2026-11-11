import type { BackupStorageAdapter } from "../types";

export const mockBackupStorageAdapter: BackupStorageAdapter = {
  name: "Mock R2",
  location: "Cloudflare R2 (EU jurisdiction), demo",
  async signedDownloadUrl(objectKey) {
    return `/demo-download/${encodeURIComponent(objectKey)}`;
  },
};
