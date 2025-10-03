import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageQuotaService } from './storage-quota.service';
import { StorageQuota } from '../file/entities/storage-quota.entity';
import { Company } from '../company/entities/company.entity';
import { File } from '../file/entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StorageQuota,
      Company,
      File,
    ]),
  ],
  providers: [StorageQuotaService],
  exports: [StorageQuotaService],
})
export class StorageModule {}
