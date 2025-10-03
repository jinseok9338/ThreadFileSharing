import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = (configService: ConfigService): MulterOptions => ({
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Temporary storage for processing
      cb(null, '/tmp/uploads');
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: configService.get<number>(
      'FILE_UPLOAD_MAX_SIZE_BYTES',
      5368709120, // 5GB default
    ),
    files: configService.get<number>('FILE_UPLOAD_MAX_FILES', 10),
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = configService
      .get<string>('FILE_UPLOAD_ALLOWED_MIMETYPES', '')
      .split(',')
      .filter(Boolean);

    if (allowedMimeTypes.length === 0) {
      // If no restrictions, allow all
      cb(null, true);
      return;
    }

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `File type '${file.mimetype}' is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
        ),
        false,
      );
    }
  },
});
