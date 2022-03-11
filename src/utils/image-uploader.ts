import config from 'config';
import multer from 'multer';
import path from 'path';

export default () => {
  const storage = multer.memoryStorage();
  return multer({
    storage,
    limits: { fileSize: parseInt(config.get('images.size'), 10) },
    fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const validImageTypes = 'jpeg, jpg, png';
      const mimetype = validImageTypes.includes(file.mimetype);
      const extension = validImageTypes.includes(path.extname(file.originalname).toLowerCase());

      if (mimetype && extension) {
        return cb(null, true);
      }

      cb(new Error(`You can upload only these image types - ${validImageTypes}`));
    }
  });
};
