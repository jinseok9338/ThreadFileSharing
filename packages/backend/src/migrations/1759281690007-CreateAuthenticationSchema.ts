import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateAuthenticationSchema1759281690007
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension if not exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 1. Create Company table
    await queryRunner.createTable(
      new Table({
        name: 'companies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'plan',
            type: 'enum',
            enum: ['free', 'pro', 'enterprise'],
            default: "'free'",
            isNullable: false,
          },
          {
            name: 'max_users',
            type: 'integer',
            default: 100,
            isNullable: false,
          },
          {
            name: 'max_storage_bytes',
            type: 'bigint',
            default: 5368709120, // 5GB
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Indexes for Company
    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'IDX_COMPANIES_SLUG',
        columnNames: ['slug'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'IDX_COMPANIES_PLAN',
        columnNames: ['plan'],
      }),
    );
    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'IDX_COMPANIES_DELETED_AT',
        columnNames: ['deleted_at'],
      }),
    );

    // 2. Create User table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'username',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'full_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'avatar_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'google_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'azure_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'company_role',
            type: 'enum',
            enum: ['owner', 'admin', 'member'],
            default: "'member'",
            isNullable: false,
          },
          {
            name: 'email_verified',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'failed_login_attempts',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'locked_until',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Foreign key: User -> Company
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for User
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_EMAIL',
        columnNames: ['email'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_COMPANY_ID_ROLE',
        columnNames: ['company_id', 'company_role'],
      }),
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_EMAIL_VERIFIED',
        columnNames: ['email_verified'],
      }),
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_DELETED_AT',
        columnNames: ['deleted_at'],
      }),
    );

    // 3. Create RefreshToken table
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'token_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'revoked',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'revoked_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'last_used_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Foreign key: RefreshToken -> User
    await queryRunner.createForeignKey(
      'refresh_tokens',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for RefreshToken
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'IDX_REFRESH_TOKENS_TOKEN_HASH',
        columnNames: ['token_hash'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'IDX_REFRESH_TOKENS_USER_LOOKUP',
        columnNames: ['user_id', 'revoked', 'expires_at'],
      }),
    );
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'IDX_REFRESH_TOKENS_EXPIRES_AT',
        columnNames: ['expires_at'],
      }),
    );

    // 4. Create CompanyInvitation table
    await queryRunner.createTable(
      new Table({
        name: 'company_invitations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'invited_by_user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'member'],
            default: "'member'",
            isNullable: false,
          },
          {
            name: 'token',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'accepted', 'expired', 'revoked'],
            default: "'pending'",
            isNullable: false,
          },
          {
            name: 'accepted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign keys: CompanyInvitation -> Company, User
    await queryRunner.createForeignKey(
      'company_invitations',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'company_invitations',
      new TableForeignKey({
        columnNames: ['invited_by_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for CompanyInvitation
    await queryRunner.createIndex(
      'company_invitations',
      new TableIndex({
        name: 'IDX_COMPANY_INVITATIONS_TOKEN',
        columnNames: ['token'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'company_invitations',
      new TableIndex({
        name: 'IDX_COMPANY_INVITATIONS_COMPANY_EMAIL',
        columnNames: ['company_id', 'email', 'status'],
      }),
    );
    await queryRunner.createIndex(
      'company_invitations',
      new TableIndex({
        name: 'IDX_COMPANY_INVITATIONS_EXPIRES_AT',
        columnNames: ['expires_at'],
      }),
    );

    // 5. Create ThreadParticipant table
    await queryRunner.createTable(
      new Table({
        name: 'thread_participants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'thread_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['owner', 'member', 'viewer'],
            default: "'member'",
            isNullable: false,
          },
          {
            name: 'can_upload',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'can_comment',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'can_invite',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'joined_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'last_read_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Foreign key: ThreadParticipant -> User
    // Note: thread_id FK will be added when Thread entity is created in future feature
    await queryRunner.createForeignKey(
      'thread_participants',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for ThreadParticipant
    await queryRunner.createIndex(
      'thread_participants',
      new TableIndex({
        name: 'IDX_THREAD_PARTICIPANTS_THREAD_USER',
        columnNames: ['thread_id', 'user_id'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'thread_participants',
      new TableIndex({
        name: 'IDX_THREAD_PARTICIPANTS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    // 6. Create Team table
    await queryRunner.createTable(
      new Table({
        name: 'teams',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign key: Team -> Company
    await queryRunner.createForeignKey(
      'teams',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for Team
    await queryRunner.createIndex(
      'teams',
      new TableIndex({
        name: 'IDX_TEAMS_COMPANY_ID',
        columnNames: ['company_id'],
      }),
    );
    await queryRunner.createIndex(
      'teams',
      new TableIndex({
        name: 'IDX_TEAMS_COMPANY_NAME',
        columnNames: ['company_id', 'name'],
      }),
    );

    // 7. Create TeamMember table
    await queryRunner.createTable(
      new Table({
        name: 'team_members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'team_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'joined_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign keys: TeamMember -> Team, User
    await queryRunner.createForeignKey(
      'team_members',
      new TableForeignKey({
        columnNames: ['team_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'teams',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'team_members',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for TeamMember
    await queryRunner.createIndex(
      'team_members',
      new TableIndex({
        name: 'IDX_TEAM_MEMBERS_TEAM_USER',
        columnNames: ['team_id', 'user_id'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'team_members',
      new TableIndex({
        name: 'IDX_TEAM_MEMBERS_USER_ID',
        columnNames: ['user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign keys)
    await queryRunner.dropTable('team_members', true);
    await queryRunner.dropTable('teams', true);
    await queryRunner.dropTable('thread_participants', true);
    await queryRunner.dropTable('company_invitations', true);
    await queryRunner.dropTable('refresh_tokens', true);
    await queryRunner.dropTable('users', true);
    await queryRunner.dropTable('companies', true);
  }
}
