import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixColumnNamesToCamelCase1759407500000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log(
      '🔄 Converting database columns from snake_case to camelCase...',
    );

    // 1. Fix companies table
    console.log('📦 Fixing companies table...');
    await queryRunner.query(`
      ALTER TABLE companies 
      RENAME COLUMN max_users TO "maxUsers"
    `);
    await queryRunner.query(`
      ALTER TABLE companies 
      RENAME COLUMN max_storage_bytes TO "maxStorageBytes"
    `);
    await queryRunner.query(`
      ALTER TABLE companies 
      RENAME COLUMN created_at TO "createdAt"
    `);
    await queryRunner.query(`
      ALTER TABLE companies 
      RENAME COLUMN updated_at TO "updatedAt"
    `);
    await queryRunner.query(`
      ALTER TABLE companies 
      RENAME COLUMN deleted_at TO "deletedAt"
    `);

    // 2. Fix users table
    console.log('👥 Fixing users table...');
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN company_id TO "companyId"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN full_name TO "fullName"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN avatar_url TO "avatarUrl"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN password_hash TO "password"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN google_id TO "googleId"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN azure_id TO "azureId"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN company_role TO "companyRole"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN email_verified TO "emailVerified"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN is_active TO "isActive"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN failed_login_attempts TO "failedLoginAttempts"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN locked_until TO "lockedUntil"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN last_login_at TO "lastLoginAt"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN created_at TO "createdAt"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN updated_at TO "updatedAt"
    `);
    await queryRunner.query(`
      ALTER TABLE users 
      RENAME COLUMN deleted_at TO "deletedAt"
    `);

    // 3. Fix refresh_tokens table
    console.log('🔑 Fixing refresh_tokens table...');
    await queryRunner.query(`
      ALTER TABLE refresh_tokens 
      RENAME COLUMN user_id TO "userId"
    `);
    await queryRunner.query(`
      ALTER TABLE refresh_tokens 
      RENAME COLUMN token_hash TO "tokenHash"
    `);
    await queryRunner.query(`
      ALTER TABLE refresh_tokens 
      RENAME COLUMN expires_at TO "expiresAt"
    `);
    await queryRunner.query(`
      ALTER TABLE refresh_tokens 
      RENAME COLUMN revoked_at TO "revokedAt"
    `);
    await queryRunner.query(`
      ALTER TABLE refresh_tokens 
      RENAME COLUMN created_at TO "createdAt"
    `);
    await queryRunner.query(`
      ALTER TABLE refresh_tokens 
      RENAME COLUMN last_used_at TO "lastUsedAt"
    `);

    // 4. Fix company_invitations table
    console.log('✉️ Fixing company_invitations table...');
    await queryRunner.query(`
      ALTER TABLE company_invitations 
      RENAME COLUMN company_id TO "companyId"
    `);
    await queryRunner.query(`
      ALTER TABLE company_invitations 
      RENAME COLUMN invited_by_user_id TO "invitedByUserId"
    `);
    await queryRunner.query(`
      ALTER TABLE company_invitations 
      RENAME COLUMN expires_at TO "expiresAt"
    `);
    await queryRunner.query(`
      ALTER TABLE company_invitations 
      RENAME COLUMN accepted_at TO "acceptedAt"
    `);
    await queryRunner.query(`
      ALTER TABLE company_invitations 
      RENAME COLUMN created_at TO "createdAt"
    `);

    // 5. Fix thread_participants table
    console.log('🧵 Fixing thread_participants table...');
    await queryRunner.query(`
      ALTER TABLE thread_participants 
      RENAME COLUMN thread_id TO "threadId"
    `);
    await queryRunner.query(`
      ALTER TABLE thread_participants 
      RENAME COLUMN user_id TO "userId"
    `);
    await queryRunner.query(`
      ALTER TABLE thread_participants 
      RENAME COLUMN can_upload TO "canUpload"
    `);
    await queryRunner.query(`
      ALTER TABLE thread_participants 
      RENAME COLUMN can_comment TO "canComment"
    `);
    await queryRunner.query(`
      ALTER TABLE thread_participants 
      RENAME COLUMN can_invite TO "canInvite"
    `);
    await queryRunner.query(`
      ALTER TABLE thread_participants 
      RENAME COLUMN joined_at TO "joinedAt"
    `);
    await queryRunner.query(`
      ALTER TABLE thread_participants 
      RENAME COLUMN last_read_at TO "lastReadAt"
    `);
    await queryRunner.query(`
      ALTER TABLE thread_participants 
      RENAME COLUMN thread_role TO "threadRole"
    `);
    await queryRunner.query(`
      ALTER TABLE thread_participants 
      RENAME COLUMN access_type TO "accessType"
    `);
    await queryRunner.query(`
      ALTER TABLE thread_participants 
      RENAME COLUMN shared_by_user_id TO "sharedByUserId"
    `);
    await queryRunner.query(`
      ALTER TABLE thread_participants 
      RENAME COLUMN shared_by_username TO "sharedByUsername"
    `);
    await queryRunner.query(`
      ALTER TABLE thread_participants 
      RENAME COLUMN shared_at TO "sharedAt"
    `);

    // 6. Fix teams table
    console.log('👥 Fixing teams table...');
    await queryRunner.query(`
      ALTER TABLE teams 
      RENAME COLUMN company_id TO "companyId"
    `);
    await queryRunner.query(`
      ALTER TABLE teams 
      RENAME COLUMN created_at TO "createdAt"
    `);
    await queryRunner.query(`
      ALTER TABLE teams 
      RENAME COLUMN updated_at TO "updatedAt"
    `);

    // 7. Fix team_members table
    console.log('👤 Fixing team_members table...');
    await queryRunner.query(`
      ALTER TABLE team_members 
      RENAME COLUMN team_id TO "teamId"
    `);
    await queryRunner.query(`
      ALTER TABLE team_members 
      RENAME COLUMN user_id TO "userId"
    `);
    await queryRunner.query(`
      ALTER TABLE team_members 
      RENAME COLUMN joined_at TO "joinedAt"
    `);

    // 8. Update indexes to use new column names
    console.log('🔍 Updating indexes...');

    // Drop old indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USERS_COMPANY_ID_ROLE"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USERS_EMAIL_VERIFIED"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USERS_DELETED_AT"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_THREAD_PARTICIPANTS_THREAD_USER"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_THREAD_PARTICIPANTS_USER_ID"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_COMPANIES_DELETED_AT"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_TEAMS_COMPANY_ID"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_TEAMS_COMPANY_NAME"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_TEAM_MEMBERS_TEAM_USER"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_TEAM_MEMBERS_USER_ID"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_REFRESH_TOKENS_USER_LOOKUP"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_REFRESH_TOKENS_EXPIRES_AT"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_COMPANY_INVITATIONS_COMPANY_EMAIL"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_COMPANY_INVITATIONS_EXPIRES_AT"`,
    );

    // Create new indexes with camelCase column names
    await queryRunner.query(`
      CREATE INDEX "IDX_USERS_COMPANY_ID_ROLE" ON "users" ("companyId", "companyRole")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_USERS_EMAIL_VERIFIED" ON "users" ("emailVerified")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_USERS_DELETED_AT" ON "users" ("deletedAt")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_THREAD_PARTICIPANTS_THREAD_USER" ON "thread_participants" ("threadId", "userId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_THREAD_PARTICIPANTS_USER_ID" ON "thread_participants" ("userId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_COMPANIES_DELETED_AT" ON "companies" ("deletedAt")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_TEAMS_COMPANY_ID" ON "teams" ("companyId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_TEAMS_COMPANY_NAME" ON "teams" ("companyId", "name")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_TEAM_MEMBERS_TEAM_USER" ON "team_members" ("teamId", "userId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_TEAM_MEMBERS_USER_ID" ON "team_members" ("userId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_REFRESH_TOKENS_USER_LOOKUP" ON "refresh_tokens" ("userId", "revoked", "expiresAt")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_REFRESH_TOKENS_EXPIRES_AT" ON "refresh_tokens" ("expiresAt")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_COMPANY_INVITATIONS_COMPANY_EMAIL" ON "company_invitations" ("companyId", "email", "status")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_COMPANY_INVITATIONS_EXPIRES_AT" ON "company_invitations" ("expiresAt")
    `);

    console.log('✅ Column name conversion completed!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log(
      '🔄 Reverting database columns from camelCase to snake_case...',
    );

    // This is a complex rollback - in production, you might want to create a separate rollback migration
    // For now, we'll just log a warning
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
