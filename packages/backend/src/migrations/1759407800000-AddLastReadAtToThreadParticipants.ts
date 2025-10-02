import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastReadAtToThreadParticipants1759407800000
  implements MigrationInterface
{
  name = 'AddLastReadAtToThreadParticipants1759407800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Adding lastReadAt column to thread_participants table...');

    // Check if lastReadAt column exists
    const columns = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'thread_participants' AND column_name = 'lastReadAt'
    `);

    if (columns.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        ADD COLUMN "lastReadAt" TIMESTAMP NULL
      `);
      console.log('✅ Added lastReadAt column to thread_participants table');
    } else {
      console.log('⚠️  lastReadAt column already exists');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log(
      '🔄 Removing lastReadAt column from thread_participants table...',
    );

    await queryRunner.query(`
      ALTER TABLE "thread_participants" 
      DROP COLUMN IF EXISTS "lastReadAt"
    `);

    console.log('✅ Removed lastReadAt column from thread_participants table');
  }
}
