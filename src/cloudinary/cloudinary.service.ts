import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadImages(
    files: Array<Express.Multer.File>,
  ): Promise<(UploadApiResponse | UploadApiErrorResponse)[]> {
    const uploadPromises = files.map((file) => {
      return cloudinary.uploader.upload(file.path, {
        folder: 'inventory',
      });
    });

    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new Error('Error uploading images to Cloudinary: ' + error.message);
    }
  }

  async uploadImage(
    filePath: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        filePath.path,
        { folder: 'practice' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    });
  }

  async deleteImages(publicIds: string[]): Promise<void> {
    await Promise.all(
      publicIds.map(async (publicId) => {
        try {
          const result = await cloudinary.uploader.destroy(publicId);

          if (result.result === 'ok') {
            console.log(`Image with public_id: ${publicId} has been deleted.`);
          } else {
            console.warn(`Failed to delete image with public_id: ${publicId}.`);
          }
        } catch (error) {
          console.error(
            `Error deleting image with public_id: ${publicId}`,
            error,
          );
        }
      }),
    );
  }

  async deleteImage(public_id: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(public_id);

      if (result.result === 'ok') {
        console.log(`Image with public_id: ${public_id} has been deleted.`);
      } else {
        console.log(`Failed to delete image with public_id: ${public_id}.`);
      }
    } catch (error) {
      console.error(`Error deleting image with public_id: ${public_id}`, error);
      throw new Error(
        `Error deleting image with public_id: ${public_id}: ${error.message}`,
      );
    }
  }
}
