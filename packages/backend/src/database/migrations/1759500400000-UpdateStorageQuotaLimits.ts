import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStorageQuotaLimits1759500400000
  implements MigrationInterface
{
  name = 'UpdateStorageQuotaLimits1759500400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update Company maxStorageBytes from 5GB to 50GB for FREE plan
    await queryRunner.query(`
      UPDATE companies 
      SET "maxStorageBytes" = 53687091200 
      WHERE plan = 'free' AND "maxStorageBytes" = 5368709120
    `);

    // Update existing storage_quota records to reflect new limits
    await queryRunner.query(`
      UPDATE storage_quota 
      SET "storageLimitBytes" = 53687091200 
      WHERE "storageLimitBytes" = 5368709120
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert Company maxStorageBytes back to 5GB
    await queryRunner.query(`
      UPDATE companies 
      SET "maxStorageBytes" = 5368709120 
      WHERE plan = 'free' AND "maxStorageBytes" = 53687091200
    `);

    // Revert storage_quota records back to 5GB limits
    await queryRunner.query(`
      UPDATE storage_quota 
      SET "storageLimitBytes" = 5368709120 
      WHERE "storageLimitBytes" = 53687091200
    `);
  }
}
