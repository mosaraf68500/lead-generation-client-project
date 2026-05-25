/**
 * Cloudinary SDK init + a tiny `uploadBuffer` helper used by media-handling
 * services (course thumbnails, user avatars). We expose a buffer-based API
 * because requests come through multer's memory storage, never the filesystem.
 */
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';
import { env } from './env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Stream-upload a Buffer to Cloudinary and return a normalised, lightweight
 * shape that we persist in MongoDB (we never store the full upload payload).
 */
export const uploadBuffer = (
  buffer: Buffer,
  options: UploadApiOptions = {},
): Promise<CloudinaryUploadResult> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_UPLOAD_FOLDER,
        resource_type: 'auto',
        ...options,
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error ?? new Error('Unknown Cloudinary upload error'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });

/** Best-effort cleanup when replacing or deleting a resource. */
export const destroyAsset = async (publicId: string): Promise<void> => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
};

export { cloudinary };
