import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingThreadParticipantColumns1759407900000
  implements MigrationInterface
{
  name = 'AddMissingThreadParticipantColumns1759407900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Adding missing columns to thread_participants table...');

    // Check current columns
    const columns = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'thread_participants'
    `);

    const columnNames = columns.map((col: any) => col.column_name);
    console.log('📋 Existing columns:', columnNames);

    // Add missing columns
    if (!columnNames.includes('accessType')) {
      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        ADD COLUMN "accessType" character varying NOT NULL DEFAULT 'member'
      `);
      console.log('✅ Added accessType column');
    }

    if (!columnNames.includes('threadRole')) {
      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        ADD COLUMN "threadRole" character varying NOT NULL DEFAULT 'member'
      `);
      console.log('✅ Added threadRole column');
    }

    if (!columnNames.includes('sharedByUserId')) {
      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        ADD COLUMN "sharedByUserId" uuid NULL
      `);
      console.log('✅ Added sharedByUserId column');
    }

    if (!columnNames.includes('sharedByUsername')) {
      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        ADD COLUMN "sharedByUsername" character varying(100) NULL
      `);
      console.log('✅ Added sharedByUsername column');
    }

    if (!columnNames.includes('sharedAt')) {
      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        ADD COLUMN "sharedAt" TIMESTAMP NULL
      `);
      console.log('✅ Added sharedAt column');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Removing added columns from thread_participants table...');

    await queryRunner.query(`
      ALTER TABLE "thread_participants" 
      DROP COLUMN IF EXISTS "accessType"
    `);

    await queryRunner.query(`
      ALTER TABLE "thread_participants" 
      DROP COLUMN IF EXISTS "threadRole"
    `);

    await queryRunner.query(`
      ALTER TABLE "thread_participants" 
      DROP COLUMN IF EXISTS "sharedByUserId"
    `);

    await queryRunner.query(`
      ALTER TABLE "thread_participants" 
      DROP COLUMN IF EXISTS "sharedByUsername"
    `);

    await queryRunner.query(`
      ALTER TABLE "thread_participants" 
      DROP COLUMN IF EXISTS "sharedAt"
    `);

    console.log('✅ Removed added columns from thread_participants table');
  }
}
