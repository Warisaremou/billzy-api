import { registerAs } from "@nestjs/config";

export default registerAs("file", () => ({
  driver: process.env.FILE_DRIVER || "local",
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
  bucketId: process.env.AWS_S3_BUCKET_ID,
  bucketEndpoint: process.env.AWS_S3_BUCKET_ENDPOINT,
  maxFileSize: parseInt(process.env.FILE_MAX_SIZE || "5242880", 10),
}));
