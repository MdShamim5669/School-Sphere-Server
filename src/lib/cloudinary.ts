import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import config from "../config/index.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

/**
 * Extracts Cloudinary public_id from a full Cloudinary URL
 * e.g. "https://res.cloudinary.com/cloudname/image/upload/v12345/school-sphere/teachers/sample.jpg"
 * -> "school-sphere/teachers/sample"
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    if (!url || typeof url !== "string" || !url.includes("/upload/")) {
      return null;
    }
    const uploadIndex = url.indexOf("/upload/");
    const pathAfterUpload = url.substring(uploadIndex + "/upload/".length);
    // Remove optional version prefix (e.g. "v1234567890/")
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
    // Remove file extension
    const lastDotIndex = pathWithoutVersion.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return pathWithoutVersion;
    }
    return pathWithoutVersion.substring(0, lastDotIndex);
  } catch (error) {
    return null;
  }
};

/**
 * Uploads a file buffer to Cloudinary
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  mimetype: string,
  folder: string
): Promise<UploadApiResponse> => {
  const b64 = Buffer.from(fileBuffer).toString("base64");
  const dataURI = `data:${mimetype};base64,${b64}`;

  return await cloudinary.uploader.upload(dataURI, {
    folder,
  });
};

/**
 * Deletes an image from Cloudinary by its publicId or full URL
 */
export const deleteImageFromCloudinary = async (
  urlOrPublicId: string | null | undefined
): Promise<any> => {
  try {
    if (!urlOrPublicId) return;

    const publicId = urlOrPublicId.startsWith("http")
      ? getPublicIdFromUrl(urlOrPublicId)
      : urlOrPublicId;

    if (!publicId) return;

    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary image deletion failed:", error);
  }
};

export default cloudinary;

