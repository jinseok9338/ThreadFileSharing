import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixThreadParticipantsTable1759407600000
  implements MigrationInterface
{
  name = 'FixThreadParticipantsTable1759407600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Fixing thread_participants table structure...');

    // Check if thread_participants table exists
    const tableExists = await queryRunner.hasTable('thread_participants');

    if (!tableExists) {
      console.log('📝 Creating thread_participants table...');

      await queryRunner.query(`
        CREATE TABLE "thread_participants" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "thread_id" uuid NOT NULL,
          "user_id" uuid NOT NULL,
          "role" character varying NOT NULL DEFAULT 'member',
          "can_upload" boolean NOT NULL DEFAULT true,
          "can_comment" boolean NOT NULL DEFAULT true,
          "can_invite" boolean NOT NULL DEFAULT false,
          "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_thread_participants_id" PRIMARY KEY ("id")
        )
      `);

      // Create foreign key constraints
      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        ADD CONSTRAINT "FK_thread_participants_thread_id" 
        FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE CASCADE
      `);

      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        ADD CONSTRAINT "FK_thread_participants_user_id" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      `);

      // Create indexes
      await queryRunner.query(`
        CREATE UNIQUE INDEX "IDX_THREAD_PARTICIPANTS_THREAD_USER" 
        ON "thread_participants" ("thread_id", "user_id")
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_THREAD_PARTICIPANTS_USER_ID" 
        ON "thread_participants" ("user_id")
      `);

      console.log('✅ thread_participants table created successfully');
    } else {
      console.log(
        '⚠️  thread_participants table already exists, checking structure...',
      );

      // Check if required columns exist
      const columns = await queryRunner.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'thread_participants'
      `);

      const columnNames = columns.map((col: any) => col.column_name);
      console.log('📋 Existing columns:', columnNames);

      // Add missing columns if needed
      if (!columnNames.includes('can_upload')) {
        await queryRunner.query(`
          ALTER TABLE "thread_participants" 
          ADD COLUMN "can_upload" boolean NOT NULL DEFAULT true
        `);
        console.log('✅ Added can_upload column');
      }

      if (!columnNames.includes('can_comment')) {
        await queryRunner.query(`
          ALTER TABLE "thread_participants" 
          ADD COLUMN "can_comment" boolean NOT NULL DEFAULT true
        `);
        console.log('✅ Added can_comment column');
      }

      if (!columnNames.includes('can_invite')) {
        await queryRunner.query(`
          ALTER TABLE "thread_participants" 
          ADD COLUMN "can_invite" boolean NOT NULL DEFAULT false
        `);
        console.log('✅ Added can_invite column');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Reverting thread_participants table changes...');

    // This is a destructive operation, so we'll just log a warning
    console.log(
      '⚠️  WARNING: This rollback will not be implemented for safety reasons.',
    );
    console.log(
      '⚠️  If you need to rollback, please restore from backup or create a new migration.',
    );

    throw new Error(
      'Rollback not implemented for safety reasons. Please restore from backup if needed.',
    );
  }
}

