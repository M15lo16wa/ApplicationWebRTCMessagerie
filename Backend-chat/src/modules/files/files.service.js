import { HttpError } from "../../lib/httpError.js";
import { messagesService } from "../messages/messages.service.js";
import { localStorageProvider } from "./storageProvider.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
  "application/pdf",
]);

export const filesService = {
  async upload({ conversationId, senderId, file }) {
    const mimeType = file.mimetype.split(";")[0].trim();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new HttpError(415, "Type de fichier non autorisé");
    }
    const { url } = await localStorageProvider.save(file.buffer, mimeType);
    return messagesService.sendFile({
      conversationId,
      senderId,
      mediaFile: {
        url,
        mimeType,
        size: file.size,
        originalName: file.originalname,
      },
    });
  },
};
