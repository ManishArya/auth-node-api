import config from 'config';
import multer from 'multer';
import path from 'path';
import { LocalizedInvalidOperationException } from '../models/Invalid-operation-exception';

export default () => {
  const storage = multer.memoryStorage();
  return multer({
    storage,
    limits: { fileSize: parseInt(config.get('images.size'), 10) },
    fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const validImageTypes = 'jpeg, jpg, png';
      let extension = path.extname(file.originalname).toLowerCase();
      extension = extension.substring(1);
      const isValidExtension = validImageTypes.includes(extension);
      const isValidMime = file.mimetype.startsWith('image');

      if (isValidMime && isValidExtension) {
        return cb(null, true);
      }

      cb(
        new LocalizedInvalidOperationException(
          `Uploading failed due to mismatch mime type or extension allowed mime is image type only, but uploading file mimeType= ${file.mimetype} & normalized path = ${extension}`,
          'imageValidation',
          { validImageTypes }
        )
      );
    }
  });
};
