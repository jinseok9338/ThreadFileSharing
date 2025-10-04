import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileUploadSessions1759570930000
  implements MigrationInterface
{
  name = 'CreateFileUploadSessions1759570930000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for upload status
    await queryRunner.query(
      `CREATE TYPE "public"."file_upload_sessions_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'failed', 'cancelled')`,
    );

    // Create file_upload_sessions table
    await queryRunner.query(`CREATE TABLE "file_upload_sessions" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "sessionId" character varying NOT NULL,
            "originalFileName" character varying NOT NULL,
            "totalSizeBytes" bigint NOT NULL,
            "uploadedChunks" integer NOT NULL DEFAULT '0',
            "totalChunks" integer NOT NULL,
            "uploadedBytes" bigint NOT NULL DEFAULT '0',
            "status" "public"."file_upload_sessions_status_enum" NOT NULL DEFAULT 'pending',
            "chunkMetadata" jsonb NOT NULL DEFAULT '[]',
            "metadata" jsonb,
            "uploadedById" uuid NOT NULL,
            "chatroomId" uuid,
            "threadId" uuid,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "completedAt" TIMESTAMP,
            "expiresAt" TIMESTAMP,
            CONSTRAINT "UQ_file_upload_sessions_sessionId" UNIQUE ("sessionId"),
            CONSTRAINT "PK_file_upload_sessions" PRIMARY KEY ("id")
        )`);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_file_upload_sessions_expiresAt" ON "file_upload_sessions" ("expiresAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_file_upload_sessions_threadId_status" ON "file_upload_sessions" ("threadId", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_file_upload_sessions_chatroomId_status" ON "file_upload_sessions" ("chatroomId", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_file_upload_sessions_uploadedById_status" ON "file_upload_sessions" ("uploadedById", "status")`,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "file_upload_sessions" ADD CONSTRAINT "FK_file_upload_sessions_uploadedById" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_upload_sessions" ADD CONSTRAINT "FK_file_upload_sessions_chatroomId" FOREIGN KEY ("chatroomId") REFERENCES "chatrooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_upload_sessions" ADD CONSTRAINT "FK_file_upload_sessions_threadId" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "file_upload_sessions" DROP CONSTRAINT "FK_file_upload_sessions_threadId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_upload_sessions" DROP CONSTRAINT "FK_file_upload_sessions_chatroomId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_upload_sessions" DROP CONSTRAINT "FK_file_upload_sessions_uploadedById"`,
    );

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "public"."IDX_file_upload_sessions_uploadedById_status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_file_upload_sessions_chatroomId_status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_file_upload_sessions_threadId_status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_file_upload_sessions_expiresAt"`,
    );

    // Drop table
    await queryRunner.query(`DROP TABLE "file_upload_sessions"`);

    // Drop enum type
    await queryRunner.query(
      `DROP TYPE "public"."file_upload_sessions_status_enum"`,
    );
  }
}
