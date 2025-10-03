import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

// Entities
import { File } from './entities/file.entity';
import { UploadProgress } from './entities/upload-progress.entity';
import { UploadSession } from './entities/upload-session.entity';
import { FileAssociation } from './entities/file-association.entity';
import { StorageQuota } from './entities/storage-quota.entity';
import { DownloadToken } from './entities/download-token.entity';

// Services
import { S3ClientService } from './services/s3-client.service';
import { FileUploadService } from './services/file-upload.service';
import { UploadProgressService } from './services/upload-progress.service';
import { FileManagementService } from './services/file-management.service';
import { StorageQuotaService } from './services/storage-quota.service';

// Controllers
import { FileUploadController } from './controllers/file-upload.controller';
import { FileManagementController } from './controllers/file-management.controller';
import { FileDownloadController } from './controllers/file-download.controller';

// Configuration
import { multerConfig } from './config/multer.config';

// WebSocket Module (forwardRef to avoid circular dependency)
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      File,
      UploadProgress,
      UploadSession,
      FileAssociation,
      StorageQuota,
      DownloadToken,
    ]),
    ConfigModule,
    MulterModule.registerAsync({
      useFactory: multerConfig,
      inject: [ConfigModule],
    }),
    forwardRef(() => WebSocketModule),
  ],
  controllers: [
    FileUploadController,
    FileManagementController,
    FileDownloadController,
  ],
  providers: [
    S3ClientService,
    FileUploadService,
    UploadProgressService,
    FileManagementService,
    StorageQuotaService,
  ],
  exports: [
    S3ClientService,
    FileUploadService,
    UploadProgressService,
    FileManagementService,
    StorageQuotaService,
  ],
})
export class FileModule {}
