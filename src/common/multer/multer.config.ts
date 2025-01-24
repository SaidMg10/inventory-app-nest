import { validateMimeType } from './file-validators';
import { BadRequestException } from '@nestjs/common';

export const multerConfig = {
  fileFilter: (req, file, callback) => {
    const isMimeTypeValid = validateMimeType(file.mimetype);

    if (isMimeTypeValid) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException('Invalid file type or extension'),
        false,
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // Limitar el tamaño del archivo a 5MB
  },
};
