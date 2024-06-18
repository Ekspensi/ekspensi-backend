import { Storage } from "@google-cloud/storage";

const getSignedUrl = async (bucketName, fileName) => {
  const storage = new Storage();
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);
  const options = {
    version: "v4",
    action: "read",
    expires: Date.now() + 1 * 60 * 1000, // 1 minutes
  };

  const [url] = await file.getSignedUrl(options);
  console.log(url);
  return url;
};

export { getSignedUrl };
