import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileUploadEntities1759481197184 implements MigrationInterface {
  name = 'AddFileUploadEntities1759481197184';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "threads" DROP CONSTRAINT "FK_b07443ec39842ea09304a880af4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "threads" DROP CONSTRAINT "FK_d288e139037a4de52d00e42e785"`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" DROP CONSTRAINT "FK_e1f9af6252f0fe9cb22f94e152d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" DROP CONSTRAINT "FK_bd57d136aa4615883e91b8f3844"`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" DROP CONSTRAINT "FK_a443b3a690edf7e690e3dace8d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatrooms" DROP CONSTRAINT "FK_36f910e4770d33652e02f7a6148"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatrooms" DROP CONSTRAINT "FK_d6ed4c814ee3b0ffff082042337"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP CONSTRAINT "FK_299a0145ecb210cee972d1cc3c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP CONSTRAINT "FK_c681bbea0da78e5b65da186a389"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" DROP CONSTRAINT "FK_10a590f29449a3a83c9fcd5b3b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatroom_members" DROP CONSTRAINT "FK_0cfa30949bc95d18f26989799b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatroom_members" DROP CONSTRAINT "FK_91a11eb3c8b768f194ff4ace89c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" DROP CONSTRAINT "FK_thread_participants_thread_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" DROP CONSTRAINT "FK_thread_participants_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_75cec923908dd7396257d743bef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_messages" DROP CONSTRAINT "FK_21868653ac5e205a1094bc7e3d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_messages" DROP CONSTRAINT "FK_778bd778cf4a607447141891ed5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_7ae6334059289559722437bcc1c"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_THREADS_CHATROOM_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_THREADS_CREATED_BY"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_THREADS_DELETED_AT"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_FILES_THREAD_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_FILES_CHATROOM_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_FILES_UPLOADED_BY"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_FILES_DELETED_AT"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_CHATROOMS_COMPANY_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_CHATROOMS_CREATED_BY"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_CHATROOMS_DELETED_AT"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_COMPANY_INVITATIONS_TOKEN"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_COMPANY_INVITATIONS_COMPANY_EMAIL"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_COMPANY_INVITATIONS_EXPIRES_AT"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_TEAM_MEMBERS_TEAM_USER"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_TEAM_MEMBERS_USER_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_TEAMS_COMPANY_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_TEAMS_COMPANY_NAME"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_COMPANIES_DELETED_AT"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_COMPANIES_SLUG"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_COMPANIES_PLAN"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_CHATROOM_MEMBERS_CHATROOM_USER"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_CHATROOM_MEMBERS_USER_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_THREAD_PARTICIPANTS_THREAD_USER"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_THREAD_PARTICIPANTS_USER_ID"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_MESSAGES_CHATROOM_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_MESSAGES_SENDER_ID"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_MESSAGES_CREATED_AT"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_THREAD_MESSAGES_THREAD_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_THREAD_MESSAGES_SENDER_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_THREAD_MESSAGES_CREATED_AT"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_REFRESH_TOKENS_USER_LOOKUP"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_REFRESH_TOKENS_EXPIRES_AT"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_REFRESH_TOKENS_TOKEN_HASH"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_USERS_EMAIL_VERIFIED"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_USERS_COMPANY_ID_ROLE"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_USERS_DELETED_AT"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_USERS_EMAIL"`);
    await queryRunner.query(
      `CREATE TYPE "public"."file_association_accesstype_enum" AS ENUM('PUBLIC', 'PRIVATE', 'RESTRICTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "file_association" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileId" uuid NOT NULL, "chatroomId" uuid, "threadId" uuid, "sharedBy" uuid NOT NULL, "accessType" "public"."file_association_accesstype_enum" NOT NULL DEFAULT 'PRIVATE', "permissions" jsonb, "expiresAt" TIMESTAMP, "isPinned" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dfa0e5c7f744918eade7330de1a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5759b64c5d5a814c2e3f17dcd7" ON "file_association" ("sharedBy") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2b7e28bbbd85f2a5179b2b9ac1" ON "file_association" ("threadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ce025a7ca0d18816536356caa1" ON "file_association" ("chatroomId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aac7ba2eb9d2487783d7ae13de" ON "file_association" ("fileId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."upload_session_status_enum" AS ENUM('ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "upload_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "companyId" uuid NOT NULL, "sessionName" character varying(255), "totalFiles" integer NOT NULL DEFAULT '0', "completedFiles" integer NOT NULL DEFAULT '0', "failedFiles" integer NOT NULL DEFAULT '0', "totalSize" bigint NOT NULL DEFAULT '0', "uploadedSize" bigint NOT NULL DEFAULT '0', "status" "public"."upload_session_status_enum" NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "completedAt" TIMESTAMP, CONSTRAINT "PK_1d9e587d0bc918af816c9aaefff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5141bb3e1c44e3869dd1730802" ON "upload_session" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_37964a1ef54c6b6a4ab8d16969" ON "upload_session" ("companyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_83cb8aea8f32ecc5b4230c8eac" ON "upload_session" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."upload_progress_status_enum" AS ENUM('PENDING', 'UPLOADING', 'COMPLETED', 'FAILED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "upload_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "uploadSessionId" uuid NOT NULL, "fileId" uuid, "userId" uuid NOT NULL, "status" "public"."upload_progress_status_enum" NOT NULL DEFAULT 'PENDING', "progressPercentage" integer NOT NULL DEFAULT '0', "bytesUploaded" bigint NOT NULL DEFAULT '0', "totalBytes" bigint NOT NULL, "uploadSpeed" bigint NOT NULL DEFAULT '0', "estimatedTimeRemaining" integer NOT NULL DEFAULT '0', "currentChunk" integer NOT NULL DEFAULT '0', "totalChunks" integer NOT NULL DEFAULT '0', "errorMessage" text, "startedAt" TIMESTAMP, "completedAt" TIMESTAMP, "lastUpdatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cfcb541e0c7eb0a214823d689b2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_77dc43fbecaa43d0fbd9dba31c" ON "upload_progress" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9c8c061c8acbd509bcaaeda379" ON "upload_progress" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_523c08fc7168483544015a3fbd" ON "upload_progress" ("fileId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_76255324aca5fe7d61cd6ad32a" ON "upload_progress" ("uploadSessionId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "download_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileId" uuid NOT NULL, "userId" uuid NOT NULL, "token" character varying(255) NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "downloadCount" integer NOT NULL DEFAULT '0', "maxDownloads" integer NOT NULL DEFAULT '1', "ipAddress" inet, "userAgent" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "lastUsedAt" TIMESTAMP, CONSTRAINT "UQ_4d9b69cb4961d170d52d62bfba5" UNIQUE ("token"), CONSTRAINT "PK_6c862a2734452435238409111a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0889773f0bb003e0dd4f489cd6" ON "download_token" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4d9b69cb4961d170d52d62bfba" ON "download_token" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9bc98a84bf3eca67ade3d19789" ON "download_token" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6bf610de6e085c24f6d706d144" ON "download_token" ("fileId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "storage_quota" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyId" uuid NOT NULL, "storageLimitBytes" bigint NOT NULL, "storageUsedBytes" bigint NOT NULL DEFAULT '0', "fileCount" integer NOT NULL DEFAULT '0', "lastCalculatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_62676f638f919c5100c95c75cd7" UNIQUE ("companyId"), CONSTRAINT "REL_62676f638f919c5100c95c75cd" UNIQUE ("companyId"), CONSTRAINT "PK_2da2f227656defdf39492278894" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_62676f638f919c5100c95c75cd" ON "storage_quota" ("companyId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "lastUsedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "googleId"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_2aa866fd1ec401cc1f4fa2efeb6"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "azureId"`);
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP COLUMN "invitedByUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP COLUMN "role"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."company_invitations_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP CONSTRAINT "UQ_d12b21996dce25ab816deffe573"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP COLUMN "token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP COLUMN "acceptedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD "companyId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD "displayName" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD "storageBucket" character varying(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "files" ADD "downloadUrl" text`);
    await queryRunner.query(
      `CREATE TYPE "public"."files_processingstatus_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD "processingStatus" "public"."files_processingstatus_enum" NOT NULL DEFAULT 'PENDING'`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD "invitedByUserId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."company_invitations_role_enum" AS ENUM('admin', 'member')`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD "role" "public"."company_invitations_role_enum" NOT NULL DEFAULT 'member'`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD "token" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD CONSTRAINT "UQ_d12b21996dce25ab816deffe573" UNIQUE ("token")`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD "acceptedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."company_invitations_companyrole_enum" AS ENUM('owner', 'admin', 'member')`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD "companyRole" "public"."company_invitations_companyrole_enum" NOT NULL DEFAULT 'member'`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD "invitationToken" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD "invitedBy" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "threads" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "threads" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "hash"`);
    await queryRunner.query(
      `ALTER TABLE "files" ADD "hash" character varying(64) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatrooms" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatrooms" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ALTER COLUMN "joinedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatroom_members" ALTER COLUMN "joinedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" DROP COLUMN "role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" ADD "role" "public"."thread_participants_role_enum" NOT NULL DEFAULT 'member'`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" DROP COLUMN "accessType"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."thread_participants_accesstype_enum" AS ENUM('member', 'shared')`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" ADD "accessType" "public"."thread_participants_accesstype_enum" NOT NULL DEFAULT 'member'`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" DROP COLUMN "threadRole"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."thread_participants_threadrole_enum" AS ENUM('owner', 'member', 'viewer')`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" ADD "threadRole" "public"."thread_participants_threadrole_enum" NOT NULL DEFAULT 'member'`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_messages" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_messages" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_a7838d2ba25be1342091b6695f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "tokenHash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "tokenHash" character varying(500) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_c25bc63d248ca90e8dcc1d92d06" UNIQUE ("tokenHash")`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "username" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_company_role_enum" RENAME TO "users_company_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_companyrole_enum" AS ENUM('owner', 'admin', 'member')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "companyRole" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "companyRole" TYPE "public"."users_companyrole_enum" USING "companyRole"::"text"::"public"."users_companyrole_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "companyRole" SET DEFAULT 'member'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_company_role_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."company_invitations_status_enum" RENAME TO "company_invitations_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."company_invitations_status_enum" AS ENUM('pending', 'accepted', 'declined', 'expired')`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ALTER COLUMN "status" TYPE "public"."company_invitations_status_enum" USING "status"::"text"::"public"."company_invitations_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."company_invitations_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1780d028232b9ed0f4da884728" ON "threads" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d288e139037a4de52d00e42e78" ON "threads" ("createdBy") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b07443ec39842ea09304a880af" ON "threads" ("chatroomId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c9c8733fcbcf68be5cb82bf81a" ON "files" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2901752f1d771f97a8bb45cb4c" ON "files" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f734c17eff711279fdda38cc4a" ON "files" ("storageKey") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b7fd70eedc0d46577c63639855" ON "files" ("hash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a443b3a690edf7e690e3dace8d" ON "files" ("uploadedBy") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bd57d136aa4615883e91b8f384" ON "files" ("chatroomId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e1f9af6252f0fe9cb22f94e152" ON "files" ("threadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a330ae0dd450f91c6b9c7fda68" ON "files" ("companyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_570c25dbcb5dd1f222bbf4902a" ON "chatrooms" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d6ed4c814ee3b0ffff08204233" ON "chatrooms" ("createdBy") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_36f910e4770d33652e02f7a614" ON "chatrooms" ("companyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_949ca0615dd0fec6147bd20503" ON "company_invitations" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_29f9fd9e0c0c432e1b246292e6" ON "company_invitations" ("companyId", "email", "status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d12b21996dce25ab816deffe57" ON "company_invitations" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0a72b849753a046462b4c5a8ec" ON "team_members" ("userId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b2f17b533905e0a94390c5e220" ON "team_members" ("teamId", "userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f40e8870b6d6a42a106cf5925e" ON "teams" ("companyId", "name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fc2a980dcd97019349b17b3921" ON "teams" ("companyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f5b48fd28eefb26ad91ec8fd12" ON "companies" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b28b07d25e4324eee577de5496" ON "companies" ("slug") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c7f6b22272ab9680e47ca1415c" ON "chatroom_members" ("chatroomId", "userId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_7c6bff1896b642caa268dbac0a" ON "thread_participants" ("threadId", "userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6ce6acdb0801254590f8a78c08" ON "messages" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2db9cf2b3ca111742793f6c37c" ON "messages" ("senderId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_75cec923908dd7396257d743be" ON "messages" ("chatroomId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_861e949a97dbe320affd3f77ef" ON "thread_messages" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_778bd778cf4a607447141891ed" ON "thread_messages" ("senderId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_21868653ac5e205a1094bc7e3d" ON "thread_messages" ("threadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_56b91d98f71e3d1b649ed6e9f3" ON "refresh_tokens" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens" ("userId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c25bc63d248ca90e8dcc1d92d0" ON "refresh_tokens" ("tokenHash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2a32f641edba1d0f973c19cc94" ON "users" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f9395c9037632a31107c8a9e5" ON "users" ("companyId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b17ece011731d382257720d39f" ON "company_invitations" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_265e3e740b00f6ba3f5f3ccb0c" ON "company_invitations" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9955c6fc3e8c37d502265ce846" ON "company_invitations" ("companyId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "file_association" ADD CONSTRAINT "FK_aac7ba2eb9d2487783d7ae13dec" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_association" ADD CONSTRAINT "FK_ce025a7ca0d18816536356caa15" FOREIGN KEY ("chatroomId") REFERENCES "chatrooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_association" ADD CONSTRAINT "FK_2b7e28bbbd85f2a5179b2b9ac14" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_association" ADD CONSTRAINT "FK_5759b64c5d5a814c2e3f17dcd7a" FOREIGN KEY ("sharedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "threads" ADD CONSTRAINT "FK_b07443ec39842ea09304a880af4" FOREIGN KEY ("chatroomId") REFERENCES "chatrooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "threads" ADD CONSTRAINT "FK_d288e139037a4de52d00e42e785" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "upload_session" ADD CONSTRAINT "FK_83cb8aea8f32ecc5b4230c8eac4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "upload_session" ADD CONSTRAINT "FK_37964a1ef54c6b6a4ab8d16969e" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "upload_progress" ADD CONSTRAINT "FK_76255324aca5fe7d61cd6ad32a9" FOREIGN KEY ("uploadSessionId") REFERENCES "upload_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "upload_progress" ADD CONSTRAINT "FK_523c08fc7168483544015a3fbde" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "upload_progress" ADD CONSTRAINT "FK_9c8c061c8acbd509bcaaeda3797" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "download_token" ADD CONSTRAINT "FK_6bf610de6e085c24f6d706d144f" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "download_token" ADD CONSTRAINT "FK_9bc98a84bf3eca67ade3d19789e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_a330ae0dd450f91c6b9c7fda688" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_e1f9af6252f0fe9cb22f94e152d" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_bd57d136aa4615883e91b8f3844" FOREIGN KEY ("chatroomId") REFERENCES "chatrooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_a443b3a690edf7e690e3dace8d9" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatrooms" ADD CONSTRAINT "FK_36f910e4770d33652e02f7a6148" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatrooms" ADD CONSTRAINT "FK_d6ed4c814ee3b0ffff082042337" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD CONSTRAINT "FK_9955c6fc3e8c37d502265ce846d" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD CONSTRAINT "FK_00055abbeb83a83ba412257fd8c" FOREIGN KEY ("invitedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "FK_6d1c8c7f705803f0711336a5c33" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "FK_0a72b849753a046462b4c5a8ec2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ADD CONSTRAINT "FK_fc2a980dcd97019349b17b3921e" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "storage_quota" ADD CONSTRAINT "FK_62676f638f919c5100c95c75cd7" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatroom_members" ADD CONSTRAINT "FK_0cfa30949bc95d18f26989799b4" FOREIGN KEY ("chatroomId") REFERENCES "chatrooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatroom_members" ADD CONSTRAINT "FK_91a11eb3c8b768f194ff4ace89c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" ADD CONSTRAINT "FK_3362fd47c9b5589e0cbe7eafe82" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" ADD CONSTRAINT "FK_30033e17812b25c47512f4c3cb7" FOREIGN KEY ("sharedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_75cec923908dd7396257d743bef" FOREIGN KEY ("chatroomId") REFERENCES "chatrooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_messages" ADD CONSTRAINT "FK_21868653ac5e205a1094bc7e3d4" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_messages" ADD CONSTRAINT "FK_778bd778cf4a607447141891ed5" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_6f9395c9037632a31107c8a9e58" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD CONSTRAINT "FK_888027e25f3cd96aca2b013e6d3" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP CONSTRAINT "FK_888027e25f3cd96aca2b013e6d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_6f9395c9037632a31107c8a9e58"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_messages" DROP CONSTRAINT "FK_778bd778cf4a607447141891ed5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_messages" DROP CONSTRAINT "FK_21868653ac5e205a1094bc7e3d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_75cec923908dd7396257d743bef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" DROP CONSTRAINT "FK_30033e17812b25c47512f4c3cb7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" DROP CONSTRAINT "FK_3362fd47c9b5589e0cbe7eafe82"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatroom_members" DROP CONSTRAINT "FK_91a11eb3c8b768f194ff4ace89c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatroom_members" DROP CONSTRAINT "FK_0cfa30949bc95d18f26989799b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "storage_quota" DROP CONSTRAINT "FK_62676f638f919c5100c95c75cd7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" DROP CONSTRAINT "FK_fc2a980dcd97019349b17b3921e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT "FK_0a72b849753a046462b4c5a8ec2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT "FK_6d1c8c7f705803f0711336a5c33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP CONSTRAINT "FK_00055abbeb83a83ba412257fd8c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP CONSTRAINT "FK_9955c6fc3e8c37d502265ce846d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatrooms" DROP CONSTRAINT "FK_d6ed4c814ee3b0ffff082042337"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatrooms" DROP CONSTRAINT "FK_36f910e4770d33652e02f7a6148"`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" DROP CONSTRAINT "FK_a443b3a690edf7e690e3dace8d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" DROP CONSTRAINT "FK_bd57d136aa4615883e91b8f3844"`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" DROP CONSTRAINT "FK_e1f9af6252f0fe9cb22f94e152d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" DROP CONSTRAINT "FK_a330ae0dd450f91c6b9c7fda688"`,
    );
    await queryRunner.query(
      `ALTER TABLE "download_token" DROP CONSTRAINT "FK_9bc98a84bf3eca67ade3d19789e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "download_token" DROP CONSTRAINT "FK_6bf610de6e085c24f6d706d144f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "upload_progress" DROP CONSTRAINT "FK_9c8c061c8acbd509bcaaeda3797"`,
    );
    await queryRunner.query(
      `ALTER TABLE "upload_progress" DROP CONSTRAINT "FK_523c08fc7168483544015a3fbde"`,
    );
    await queryRunner.query(
      `ALTER TABLE "upload_progress" DROP CONSTRAINT "FK_76255324aca5fe7d61cd6ad32a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "upload_session" DROP CONSTRAINT "FK_37964a1ef54c6b6a4ab8d16969e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "upload_session" DROP CONSTRAINT "FK_83cb8aea8f32ecc5b4230c8eac4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "threads" DROP CONSTRAINT "FK_d288e139037a4de52d00e42e785"`,
    );
    await queryRunner.query(
      `ALTER TABLE "threads" DROP CONSTRAINT "FK_b07443ec39842ea09304a880af4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_association" DROP CONSTRAINT "FK_5759b64c5d5a814c2e3f17dcd7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_association" DROP CONSTRAINT "FK_2b7e28bbbd85f2a5179b2b9ac14"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_association" DROP CONSTRAINT "FK_ce025a7ca0d18816536356caa15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file_association" DROP CONSTRAINT "FK_aac7ba2eb9d2487783d7ae13dec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9955c6fc3e8c37d502265ce846"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_265e3e740b00f6ba3f5f3ccb0c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b17ece011731d382257720d39f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f9395c9037632a31107c8a9e5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2a32f641edba1d0f973c19cc94"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c25bc63d248ca90e8dcc1d92d0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_56b91d98f71e3d1b649ed6e9f3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_21868653ac5e205a1094bc7e3d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_778bd778cf4a607447141891ed"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_861e949a97dbe320affd3f77ef"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_75cec923908dd7396257d743be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2db9cf2b3ca111742793f6c37c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6ce6acdb0801254590f8a78c08"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7c6bff1896b642caa268dbac0a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c7f6b22272ab9680e47ca1415c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b28b07d25e4324eee577de5496"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f5b48fd28eefb26ad91ec8fd12"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fc2a980dcd97019349b17b3921"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f40e8870b6d6a42a106cf5925e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2f17b533905e0a94390c5e220"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0a72b849753a046462b4c5a8ec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d12b21996dce25ab816deffe57"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_29f9fd9e0c0c432e1b246292e6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_949ca0615dd0fec6147bd20503"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_36f910e4770d33652e02f7a614"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d6ed4c814ee3b0ffff08204233"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_570c25dbcb5dd1f222bbf4902a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a330ae0dd450f91c6b9c7fda68"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e1f9af6252f0fe9cb22f94e152"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bd57d136aa4615883e91b8f384"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a443b3a690edf7e690e3dace8d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b7fd70eedc0d46577c63639855"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f734c17eff711279fdda38cc4a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2901752f1d771f97a8bb45cb4c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c9c8733fcbcf68be5cb82bf81a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b07443ec39842ea09304a880af"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d288e139037a4de52d00e42e78"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1780d028232b9ed0f4da884728"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."company_invitations_status_enum_old" AS ENUM('pending', 'accepted', 'expired', 'revoked')`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ALTER COLUMN "status" TYPE "public"."company_invitations_status_enum_old" USING "status"::"text"::"public"."company_invitations_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."company_invitations_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."company_invitations_status_enum_old" RENAME TO "company_invitations_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_company_role_enum_old" AS ENUM('owner', 'admin', 'member')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "companyRole" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "companyRole" TYPE "public"."users_company_role_enum_old" USING "companyRole"::"text"::"public"."users_company_role_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "companyRole" SET DEFAULT 'member'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_companyrole_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_company_role_enum_old" RENAME TO "users_company_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "username" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_c25bc63d248ca90e8dcc1d92d06"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP COLUMN "tokenHash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "tokenHash" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_a7838d2ba25be1342091b6695f1" UNIQUE ("tokenHash")`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_messages" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_messages" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" DROP COLUMN "threadRole"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."thread_participants_threadrole_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" ADD "threadRole" character varying NOT NULL DEFAULT 'member'`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" DROP COLUMN "accessType"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."thread_participants_accesstype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" ADD "accessType" character varying NOT NULL DEFAULT 'member'`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" DROP COLUMN "role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" ADD "role" character varying NOT NULL DEFAULT 'member'`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatroom_members" ALTER COLUMN "joinedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ALTER COLUMN "joinedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatrooms" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatrooms" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "hash"`);
    await queryRunner.query(
      `ALTER TABLE "files" ADD "hash" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "threads" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "threads" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP COLUMN "invitedBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP COLUMN "invitationToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP COLUMN "companyRole"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."company_invitations_companyrole_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP COLUMN "acceptedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP CONSTRAINT "UQ_d12b21996dce25ab816deffe573"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP COLUMN "token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP COLUMN "role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" DROP COLUMN "invitedByUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" DROP COLUMN "processingStatus"`,
    );
    await queryRunner.query(`DROP TYPE "public"."files_processingstatus_enum"`);
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "downloadUrl"`);
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "storageBucket"`);
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "displayName"`);
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "companyId"`);
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD "acceptedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD "token" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD CONSTRAINT "UQ_d12b21996dce25ab816deffe573" UNIQUE ("token")`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."company_invitations_role_enum" AS ENUM('admin', 'member')`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD "role" "public"."company_invitations_role_enum" NOT NULL DEFAULT 'member'`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD "invitedByUserId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "azureId" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_2aa866fd1ec401cc1f4fa2efeb6" UNIQUE ("azureId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "googleId" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b" UNIQUE ("googleId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "lastUsedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_62676f638f919c5100c95c75cd"`,
    );
    await queryRunner.query(`DROP TABLE "storage_quota"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6bf610de6e085c24f6d706d144"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9bc98a84bf3eca67ade3d19789"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4d9b69cb4961d170d52d62bfba"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0889773f0bb003e0dd4f489cd6"`,
    );
    await queryRunner.query(`DROP TABLE "download_token"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_76255324aca5fe7d61cd6ad32a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_523c08fc7168483544015a3fbd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9c8c061c8acbd509bcaaeda379"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_77dc43fbecaa43d0fbd9dba31c"`,
    );
    await queryRunner.query(`DROP TABLE "upload_progress"`);
    await queryRunner.query(`DROP TYPE "public"."upload_progress_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_83cb8aea8f32ecc5b4230c8eac"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_37964a1ef54c6b6a4ab8d16969"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5141bb3e1c44e3869dd1730802"`,
    );
    await queryRunner.query(`DROP TABLE "upload_session"`);
    await queryRunner.query(`DROP TYPE "public"."upload_session_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aac7ba2eb9d2487783d7ae13de"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ce025a7ca0d18816536356caa1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2b7e28bbbd85f2a5179b2b9ac1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5759b64c5d5a814c2e3f17dcd7"`,
    );
    await queryRunner.query(`DROP TABLE "file_association"`);
    await queryRunner.query(
      `DROP TYPE "public"."file_association_accesstype_enum"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_USERS_EMAIL" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USERS_DELETED_AT" ON "users" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USERS_COMPANY_ID_ROLE" ON "users" ("companyId", "companyRole") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USERS_EMAIL_VERIFIED" ON "users" ("emailVerified") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_REFRESH_TOKENS_TOKEN_HASH" ON "refresh_tokens" ("tokenHash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_REFRESH_TOKENS_EXPIRES_AT" ON "refresh_tokens" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_REFRESH_TOKENS_USER_LOOKUP" ON "refresh_tokens" ("userId", "expiresAt", "revoked") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_THREAD_MESSAGES_CREATED_AT" ON "thread_messages" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_THREAD_MESSAGES_SENDER_ID" ON "thread_messages" ("senderId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_THREAD_MESSAGES_THREAD_ID" ON "thread_messages" ("threadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_MESSAGES_CREATED_AT" ON "messages" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_MESSAGES_SENDER_ID" ON "messages" ("senderId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_MESSAGES_CHATROOM_ID" ON "messages" ("chatroomId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_THREAD_PARTICIPANTS_USER_ID" ON "thread_participants" ("userId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_THREAD_PARTICIPANTS_THREAD_USER" ON "thread_participants" ("threadId", "userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CHATROOM_MEMBERS_USER_ID" ON "chatroom_members" ("userId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_CHATROOM_MEMBERS_CHATROOM_USER" ON "chatroom_members" ("chatroomId", "userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_COMPANIES_PLAN" ON "companies" ("plan") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_COMPANIES_SLUG" ON "companies" ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_COMPANIES_DELETED_AT" ON "companies" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_TEAMS_COMPANY_NAME" ON "teams" ("companyId", "name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_TEAMS_COMPANY_ID" ON "teams" ("companyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_TEAM_MEMBERS_USER_ID" ON "team_members" ("userId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_TEAM_MEMBERS_TEAM_USER" ON "team_members" ("teamId", "userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_COMPANY_INVITATIONS_EXPIRES_AT" ON "company_invitations" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_COMPANY_INVITATIONS_COMPANY_EMAIL" ON "company_invitations" ("companyId", "email", "status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_COMPANY_INVITATIONS_TOKEN" ON "company_invitations" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CHATROOMS_DELETED_AT" ON "chatrooms" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CHATROOMS_CREATED_BY" ON "chatrooms" ("createdBy") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CHATROOMS_COMPANY_ID" ON "chatrooms" ("companyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FILES_DELETED_AT" ON "files" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FILES_UPLOADED_BY" ON "files" ("uploadedBy") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FILES_CHATROOM_ID" ON "files" ("chatroomId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FILES_THREAD_ID" ON "files" ("threadId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_THREADS_DELETED_AT" ON "threads" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_THREADS_CREATED_BY" ON "threads" ("createdBy") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_THREADS_CHATROOM_ID" ON "threads" ("chatroomId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_7ae6334059289559722437bcc1c" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_messages" ADD CONSTRAINT "FK_778bd778cf4a607447141891ed5" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_messages" ADD CONSTRAINT "FK_21868653ac5e205a1094bc7e3d4" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_75cec923908dd7396257d743bef" FOREIGN KEY ("chatroomId") REFERENCES "chatrooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" ADD CONSTRAINT "FK_thread_participants_user_id" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_participants" ADD CONSTRAINT "FK_thread_participants_thread_id" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatroom_members" ADD CONSTRAINT "FK_91a11eb3c8b768f194ff4ace89c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatroom_members" ADD CONSTRAINT "FK_0cfa30949bc95d18f26989799b4" FOREIGN KEY ("chatroomId") REFERENCES "chatrooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ADD CONSTRAINT "FK_10a590f29449a3a83c9fcd5b3b3" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD CONSTRAINT "FK_c681bbea0da78e5b65da186a389" FOREIGN KEY ("invitedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD CONSTRAINT "FK_299a0145ecb210cee972d1cc3c8" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatrooms" ADD CONSTRAINT "FK_d6ed4c814ee3b0ffff082042337" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatrooms" ADD CONSTRAINT "FK_36f910e4770d33652e02f7a6148" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_a443b3a690edf7e690e3dace8d9" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_bd57d136aa4615883e91b8f3844" FOREIGN KEY ("chatroomId") REFERENCES "chatrooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_e1f9af6252f0fe9cb22f94e152d" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "threads" ADD CONSTRAINT "FK_d288e139037a4de52d00e42e785" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "threads" ADD CONSTRAINT "FK_b07443ec39842ea09304a880af4" FOREIGN KEY ("chatroomId") REFERENCES "chatrooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
