import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
// import { MulterModule } from '@nestjs/platform-express'; // Fastify multipart 사용으로 불필요

// Entities
import { File } from './entities/file.entity';
import { UploadProgress } from './entities/upload-progress.entity';
import { UploadSession } from './entities/upload-session.entity';
import { FileAssociation } from './entities/file-association.entity';
import { StorageQuota } from './entities/storage-quota.entity';
import { DownloadToken } from './entities/download-token.entity';
import { User } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';

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
// import { multerConfig } from './config/multer.config'; // Fastify multipart 사용으로 불필요

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
      User,
      Company,
    ]),
    ConfigModule,
    // MulterModule.register(multerConfig), // Fastify multipart 사용으로 불필요
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
