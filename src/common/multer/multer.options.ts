import { HttpStatus, HttpException } from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express/multer';
import * as multer from 'multer';
import * as path from 'path';

const storage = multer.memoryStorage();

const maxSize = 7 * 1024 * 1024; // 7 MB

const multerOptions: MulterModuleOptions = {
  storage: storage,
  limits: {
    fieldNameSize: 255,
    fileSize: maxSize,
  },
  fileFilter: (req, file, callback) => {
    //check if file is empty or null or undefined
    if (!file) {
      return callback(
        new HttpException('No file uploaded.', HttpStatus.BAD_REQUEST),
        false,
      );
    }
    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new HttpException(
          'Invalid file type. Only JPEG, JPG, and PNG are allowed.',
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return callback(
        new HttpException(
          'Invalid file extension. Only .jpg, .jpeg, and .png are allowed.',
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }

    // Check file size
    if (file.size > maxSize) {
      return callback(
        new HttpException(
          'File size exceeds the maximum limit of 7 MB.',
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }

    // Check for common scripting languages
    const disallowedExtensions = ['.php', '.py', '.js', '.rb', '.sh'];
    if (
      disallowedExtensions.some((ext) =>
        file.originalname.toLowerCase().includes(ext),
      )
    ) {
      return callback(
        new HttpException(
          'Invalid file. Scripting language files are not allowed.',
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }

    callback(null, true);
  },
};

export default multerOptions;
