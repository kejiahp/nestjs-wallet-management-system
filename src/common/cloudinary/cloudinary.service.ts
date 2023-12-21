import { Injectable } from '@nestjs/common';

import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { ConfigOptions } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    const cloudinaryConfig: ConfigOptions = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };
    v2.config(cloudinaryConfig);
  }

  async uploadBase64Image(base64Data: string): Promise<UploadApiResponse> {
    try {
      const result = await v2.uploader.upload(base64Data, {
        //upload_preset: 'your_upload_preset', // Replace with your Cloudinary upload preset
        folder: 'wallet_management_app', // Replace with the folder name you want to save your file in on Cloudinary (optional)
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      const readableStream = Readable.from(file.buffer);
      readableStream.pipe(upload);
    });
  }
}
