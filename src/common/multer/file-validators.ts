import { ALLOWED_MIME_TYPES } from './mime-types.valids';

export const validateMimeType = (mimetype: string): boolean =>
  ALLOWED_MIME_TYPES.includes(mimetype);

// export const validateFileExtension = (fileName: string): boolean => {
//   const extension = path.extname(fileName).toLowerCase();
//   return ALLOWED_EXTENSIONS.includes(extension);
// };
