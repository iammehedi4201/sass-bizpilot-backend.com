import { spacesConfig } from "@/config/spaces.config";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type {
  DeleteObjectCommandOutput,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";

// ====================
// S3 Client (cached for performance)
// ====================

let cachedClient: S3Client | null = null;

const getS3Client = (): S3Client => {
  if (!cachedClient) {
    cachedClient = new S3Client({
      endpoint: spacesConfig.endpoint,
      forcePathStyle: false,
      region: spacesConfig.region,
      credentials: {
        accessKeyId: spacesConfig.accessKeyId,
        secretAccessKey: spacesConfig.secretAccessKey,
      },
    });
  }
  return cachedClient;
};

// ====================
// Types
// ====================

type UploadBody = Buffer | Uint8Array | Blob | string | ReadableStream;

type UpdateResult = {
  upload: PutObjectCommandOutput;
  delete: DeleteObjectCommandOutput;
};

// ====================
// Core Functions
// ====================

export const uploadObject = async (
  key: string,
  body: UploadBody,
  mimetype?: string,
): Promise<PutObjectCommandOutput> => {
  const client = getS3Client();

  const params = {
    Bucket: spacesConfig.bucket,
    Key: key,
    Body: body,
    ACL: "public-read" as const,
    ContentType: mimetype ?? "image/jpeg",
  };

  try {
    const result = await client.send(new PutObjectCommand(params));
    console.log(`✓ Uploaded: ${spacesConfig.bucket}/${key}`);
    return result;
  } catch (error) {
    console.error(`✗ Upload failed: ${key}`, error);
    throw error;
  }
};

export const deleteObject = async (
  key: string,
): Promise<DeleteObjectCommandOutput> => {
  const client = getS3Client();

  const params = {
    Bucket: spacesConfig.bucket,
    Key: key,
  };

  try {
    const result = await client.send(new DeleteObjectCommand(params));
    console.log(`✓ Deleted: ${spacesConfig.bucket}/${key}`);
    return result;
  } catch (error) {
    console.error(`✗ Delete failed: ${key}`, error);
    throw error;
  }
};

export const updateObject = async (
  newKey: string,
  body: UploadBody,
  oldKey: string,
  mimetype?: string,
): Promise<UpdateResult> => {
  const client = getS3Client();

  const uploadParams = {
    Bucket: spacesConfig.bucket,
    Key: newKey,
    Body: body,
    ACL: "public-read" as const,
    ContentType: mimetype ?? "image/jpeg",
  };

  const deleteParams = {
    Bucket: spacesConfig.bucket,
    Key: oldKey,
  };

  try {
    const uploadResult = await client.send(new PutObjectCommand(uploadParams));
    console.log(`✓ Uploaded new: ${spacesConfig.bucket}/${newKey}`);

    const deleteResult = await client.send(
      new DeleteObjectCommand(deleteParams),
    );
    console.log(`✓ Deleted old: ${spacesConfig.bucket}/${oldKey}`);

    return { upload: uploadResult, delete: deleteResult };
  } catch (error) {
    console.error("✗ Update failed:", { newKey, oldKey }, error);
    throw error;
  }
};
