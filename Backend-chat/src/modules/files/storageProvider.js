import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, "../../../uploads");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const localStorageProvider = {
  async save(buffer, mimeType) {
    const extension = mimeType.split("/")[1] ?? "bin";
    const storedName = `${randomUUID()}.${extension}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, storedName), buffer);
    return { url: `/uploads/${storedName}` };
  },
};
