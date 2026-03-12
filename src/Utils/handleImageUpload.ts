import type {
  DeleteObjectCommandOutput,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";
import type { Request } from "express";

type UploadBody = Buffer | Uint8Array | Blob | string | ReadableStream;

type UpdateResult = {
  upload: PutObjectCommandOutput;
  delete: DeleteObjectCommandOutput;
};

type UploadFunction = (
  key: string,
  body: UploadBody,
  mimetype?: string,
) => Promise<PutObjectCommandOutput>;

type UpdateFunction = (
  newKey: string,
  body: UploadBody,
  oldKey: string,
  mimetype?: string,
) => Promise<UpdateResult>;

interface UploadedFile {
  name: string;
  data: Buffer;
  mimetype: string;
}

interface RequestWithFiles extends Omit<Request, "files"> {
  files?: {
    [key: string]: UploadedFile | UploadedFile[];
  };
}

interface HandleImageUploadParams {
  req: RequestWithFiles;
  fileField: string;
  folderPath: string;
  existingImageKey?: string | null;
  uploadFunction: UploadFunction;
  updateFunction?: UpdateFunction | null;
}

export async function handleImageUpload({
  req,
  fileField,
  folderPath,
  existingImageKey = null,
  uploadFunction,
  updateFunction = null,
}: HandleImageUploadParams): Promise<string | null> {
  if (!req.files || !req.files[fileField]) {
    return null;
  }

  const imageFile = req.files[fileField];
  const file: UploadedFile = Array.isArray(imageFile)
    ? imageFile[0]
    : imageFile;

  const uniqueFilename = `${Date.now()}-${file.name}`;
  const uploadedImagePath = `${folderPath.replace(
    /\/+$/,
    "",
  )}/${uniqueFilename}`;

  try {
    if (existingImageKey && updateFunction) {
      await updateFunction(
        uploadedImagePath,
        file.data,
        existingImageKey,
        file.mimetype,
      );
    } else {
      await uploadFunction(uploadedImagePath, file.data, file.mimetype);
    }

    return uploadedImagePath;
  } catch (err) {
    console.error("Image upload failed:", err);
    throw new Error("Failed to upload image");
  }
}
