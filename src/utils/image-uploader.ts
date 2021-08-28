import config from 'config';
import multer from 'multer';
import path from 'path';

export default (directoryPath?: any) => {
  const storage = multer.memoryStorage();
  return multer({
    storage,
    limits: { fileSize: parseInt(config.get('images.size'), 10) },
    fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const allowedFileType = /jpeg|jpg|png/;
      const mimetype = allowedFileType.test(file.mimetype);
      const extension = allowedFileType.test(path.extname(file.originalname).toLowerCase());

      if (mimetype && extension) {
        return cb(null, true);
      }

      cb(new Error(`Error: File upload only supports the ' + 'following filetypes - ${allowedFileType}`));
    }
  });
};
