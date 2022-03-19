import config from 'config';
import multer from 'multer';
import path from 'path';
import logger from './logger';

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
      const isValidMime = validImageTypes.includes(file.mimetype.split('/')[1]);

      if (isValidMime && isValidExtension) {
        return cb(null, true);
      }

      logger.error(`error in uploading file mimeType= ${file.mimetype} & normalized path = ${extension}  `);

      cb(new Error(`You can upload only these image types - ${validImageTypes}`));
    }
  });
};
