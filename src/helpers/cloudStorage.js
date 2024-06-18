import { Storage } from "@google-cloud/storage";
import fs from "fs";
import path from "path";

const storage = new Storage({
  credentials:
    process.env.NODE_ENV !== "production" &&
    JSON.parse(process.env.GCP_SA_CREDENTIALS),
});

const listFiles = async (bucketName, bucketPath) => {
  const [files] = await storage.bucket(bucketName).getFiles({
    prefix: bucketPath + "/",
  });
  return files;
};

const downloadFiles = async (bucketName, bucketPath) => {
  const files = await listFiles(bucketName, bucketPath);

  await Promise.all(
    files
      .filter((file) => !file.name.endsWith("/"))
      .map(async (file) => {
        const destination = path.resolve(`./gcs/${file.name}`);

        if (!fs.existsSync(path.dirname(destination))) {
          fs.mkdirSync(path.dirname(destination), { recursive: true });
        }

        await file.download({ destination });
      })
  );
};

export { downloadFiles };
