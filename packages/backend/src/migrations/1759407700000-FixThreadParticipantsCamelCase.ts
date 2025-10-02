import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixThreadParticipantsCamelCase1759407700000
  implements MigrationInterface
{
  name = 'FixThreadParticipantsCamelCase1759407700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Fixing thread_participants table to use camelCase...');

    // Check if thread_participants table exists
    const tableExists = await queryRunner.hasTable('thread_participants');

    if (!tableExists) {
      console.log('📝 Creating thread_participants table with camelCase...');

      await queryRunner.query(`
        CREATE TABLE "thread_participants" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "threadId" uuid NOT NULL,
          "userId" uuid NOT NULL,
          "role" character varying NOT NULL DEFAULT 'member',
          "canUpload" boolean NOT NULL DEFAULT true,
          "canComment" boolean NOT NULL DEFAULT true,
          "canInvite" boolean NOT NULL DEFAULT false,
          "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_thread_participants_id" PRIMARY KEY ("id")
        )
      `);

      // Create foreign key constraints
      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        ADD CONSTRAINT "FK_thread_participants_thread_id" 
        FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE CASCADE
      `);

      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        ADD CONSTRAINT "FK_thread_participants_user_id" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      `);

      // Create indexes
      await queryRunner.query(`
        CREATE UNIQUE INDEX "IDX_THREAD_PARTICIPANTS_THREAD_USER" 
        ON "thread_participants" ("threadId", "userId")
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_THREAD_PARTICIPANTS_USER_ID" 
        ON "thread_participants" ("userId")
      `);

      console.log('✅ thread_participants table created with camelCase');
    } else {
      console.log(
        '⚠️  thread_participants table already exists, checking structure...',
      );

      // Check current columns
      const columns = await queryRunner.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'thread_participants'
      `);

      const columnNames = columns.map((col: any) => col.column_name);
      console.log('📋 Existing columns:', columnNames);

      // Drop the table and recreate with camelCase
      console.log('🔄 Dropping and recreating thread_participants table...');

      // Drop foreign key constraints first
      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        DROP CONSTRAINT IF EXISTS "FK_thread_participants_thread_id"
      `);

      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        DROP CONSTRAINT IF EXISTS "FK_thread_participants_user_id"
      `);

      // Drop indexes
      await queryRunner.query(`
        DROP INDEX IF EXISTS "IDX_THREAD_PARTICIPANTS_THREAD_USER"
      `);

      await queryRunner.query(`
        DROP INDEX IF EXISTS "IDX_THREAD_PARTICIPANTS_USER_ID"
      `);

      // Drop table
      await queryRunner.query(`DROP TABLE "thread_participants"`);

      // Recreate with camelCase
      await queryRunner.query(`
        CREATE TABLE "thread_participants" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "threadId" uuid NOT NULL,
          "userId" uuid NOT NULL,
          "role" character varying NOT NULL DEFAULT 'member',
          "canUpload" boolean NOT NULL DEFAULT true,
          "canComment" boolean NOT NULL DEFAULT true,
          "canInvite" boolean NOT NULL DEFAULT false,
          "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_thread_participants_id" PRIMARY KEY ("id")
        )
      `);

      // Recreate foreign key constraints
      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        ADD CONSTRAINT "FK_thread_participants_thread_id" 
        FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE CASCADE
      `);

      await queryRunner.query(`
        ALTER TABLE "thread_participants" 
        ADD CONSTRAINT "FK_thread_participants_user_id" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      `);

      // Recreate indexes
      await queryRunner.query(`
        CREATE UNIQUE INDEX "IDX_THREAD_PARTICIPANTS_THREAD_USER" 
        ON "thread_participants" ("threadId", "userId")
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_THREAD_PARTICIPANTS_USER_ID" 
        ON "thread_participants" ("userId")
      `);

      console.log('✅ thread_participants table recreated with camelCase');
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
