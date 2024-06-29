import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads', // specify the upload directory
    filename: (req, file, cb) => {
      cb(null, `${file.fieldname}-${extname(file.originalname)}`);
    },
  }),
};

export const multerOptions = {
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
};
