import { ENV } from "./envs";

export const spacesConfig = {
  endpoint: "https://sgp1.digitaloceanspaces.com",
  region: ENV.S3_REGION,
  bucket: ENV.BUCKET,
  accessKeyId: ENV.SPACES_ACCESS_KEY,
  secretAccessKey: ENV.SPACES_SECRET,
} as const;

// Early validation — throws if any required env var is missing
if (
  !spacesConfig.bucket ||
  !spacesConfig.accessKeyId ||
  !spacesConfig.secretAccessKey
) {
  throw new Error(
    "Missing required DigitalOcean Spaces environment variables: BUCKET, ACCESS_KEY_ID, SPACES_SECRET",
  );
}
