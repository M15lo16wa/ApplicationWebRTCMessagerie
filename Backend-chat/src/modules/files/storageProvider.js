import { randomUUID } from "node:crypto";
import { Client } from "minio";
import { env } from "../../config/env.js";

const minioClient = new Client({
  endPoint: env.minio.endPoint,
  port: env.minio.port,
  useSSL: env.minio.useSSL,
  accessKey: env.minio.accessKey,
  secretKey: env.minio.secretKey,
});

const bucketReady = (async () => {
  const exists = await minioClient.bucketExists(env.minio.bucket).catch(() => false);
  if (!exists) {
    await minioClient.makeBucket(env.minio.bucket);
  }
})();

export const storageProvider = {
  async save(buffer, mimeType) {
    await bucketReady;
    const extension = mimeType.split("/")[1] ?? "bin";
    const storedName = `${randomUUID()}.${extension}`;
    await minioClient.putObject(env.minio.bucket, storedName, buffer, buffer.length, {
      "Content-Type": mimeType,
    });
    return { url: `/uploads/${storedName}` };
  },

  async statObject(storedName) {
    await bucketReady;
    return minioClient.statObject(env.minio.bucket, storedName);
  },

  async getObjectStream(storedName) {
    await bucketReady;
    return minioClient.getObject(env.minio.bucket, storedName);
  },
};
