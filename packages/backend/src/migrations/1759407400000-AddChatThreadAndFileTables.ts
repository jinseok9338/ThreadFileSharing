import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class AddChatThreadAndFileTables1759407400000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create ChatRoom table
    await queryRunner.createTable(
      new Table({
        name: 'chatrooms',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'companyId',
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
            name: 'avatarUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'isPrivate',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'createdBy',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'memberCount',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Foreign keys for ChatRoom
    await queryRunner.createForeignKey(
      'chatrooms',
      new TableForeignKey({
        columnNames: ['companyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'chatrooms',
      new TableForeignKey({
        columnNames: ['createdBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for ChatRoom
    await queryRunner.createIndex(
      'chatrooms',
      new TableIndex({
        name: 'IDX_CHATROOMS_COMPANY_ID',
        columnNames: ['companyId'],
      }),
    );
    await queryRunner.createIndex(
      'chatrooms',
      new TableIndex({
        name: 'IDX_CHATROOMS_CREATED_BY',
        columnNames: ['createdBy'],
      }),
    );
    await queryRunner.createIndex(
      'chatrooms',
      new TableIndex({
        name: 'IDX_CHATROOMS_DELETED_AT',
        columnNames: ['deletedAt'],
      }),
    );

    // 2. Create ChatRoomMember table
    await queryRunner.createTable(
      new Table({
        name: 'chatroom_members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'chatroomId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'joinedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign keys for ChatRoomMember
    await queryRunner.createForeignKey(
      'chatroom_members',
      new TableForeignKey({
        columnNames: ['chatroomId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chatrooms',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'chatroom_members',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for ChatRoomMember
    await queryRunner.createIndex(
      'chatroom_members',
      new TableIndex({
        name: 'IDX_CHATROOM_MEMBERS_CHATROOM_USER',
        columnNames: ['chatroomId', 'userId'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'chatroom_members',
      new TableIndex({
        name: 'IDX_CHATROOM_MEMBERS_USER_ID',
        columnNames: ['userId'],
      }),
    );

    // 3. Create Thread table
    await queryRunner.createTable(
      new Table({
        name: 'threads',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'chatroomId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'title',
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
            name: 'createdBy',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'isArchived',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'participantCount',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'fileCount',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'lastMessageAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Foreign keys for Thread
    await queryRunner.createForeignKey(
      'threads',
      new TableForeignKey({
        columnNames: ['chatroomId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chatrooms',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'threads',
      new TableForeignKey({
        columnNames: ['createdBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for Thread
    await queryRunner.createIndex(
      'threads',
      new TableIndex({
        name: 'IDX_THREADS_CHATROOM_ID',
        columnNames: ['chatroomId'],
      }),
    );
    await queryRunner.createIndex(
      'threads',
      new TableIndex({
        name: 'IDX_THREADS_CREATED_BY',
        columnNames: ['createdBy'],
      }),
    );
    await queryRunner.createIndex(
      'threads',
      new TableIndex({
        name: 'IDX_THREADS_DELETED_AT',
        columnNames: ['deletedAt'],
      }),
    );

    // 4. Update ThreadParticipant table to add missing foreign key
    await queryRunner.createForeignKey(
      'thread_participants',
      new TableForeignKey({
        columnNames: ['thread_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'threads',
        onDelete: 'CASCADE',
      }),
    );

    // 5. Create File table
    await queryRunner.createTable(
      new Table({
        name: 'files',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'threadId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'chatroomId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'uploadedBy',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'originalName',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'storageKey',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'mimeType',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'sizeBytes',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'isProcessed',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Foreign keys for File
    await queryRunner.createForeignKey(
      'files',
      new TableForeignKey({
        columnNames: ['threadId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'threads',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'files',
      new TableForeignKey({
        columnNames: ['chatroomId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chatrooms',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'files',
      new TableForeignKey({
        columnNames: ['uploadedBy'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for File
    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'IDX_FILES_THREAD_ID',
        columnNames: ['threadId'],
      }),
    );
    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'IDX_FILES_CHATROOM_ID',
        columnNames: ['chatroomId'],
      }),
    );
    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'IDX_FILES_UPLOADED_BY',
        columnNames: ['uploadedBy'],
      }),
    );
    await queryRunner.createIndex(
      'files',
      new TableIndex({
        name: 'IDX_FILES_DELETED_AT',
        columnNames: ['deletedAt'],
      }),
    );

    // 6. Create Message table
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'chatroomId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'senderId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'messageType',
            type: 'enum',
            enum: ['TEXT', 'SYSTEM'],
            default: "'TEXT'",
            isNullable: false,
          },
          {
            name: 'isEdited',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'editedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign keys for Message
    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['chatroomId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chatrooms',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['senderId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for Message
    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_MESSAGES_CHATROOM_ID',
        columnNames: ['chatroomId'],
      }),
    );
    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_MESSAGES_SENDER_ID',
        columnNames: ['senderId'],
      }),
    );
    await queryRunner.createIndex(
      'messages',
      new TableIndex({
        name: 'IDX_MESSAGES_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );

    // 7. Create ThreadMessage table
    await queryRunner.createTable(
      new Table({
        name: 'thread_messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'threadId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'senderId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'messageType',
            type: 'enum',
            enum: ['TEXT', 'SYSTEM'],
            default: "'TEXT'",
            isNullable: false,
          },
          {
            name: 'isEdited',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'editedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Foreign keys for ThreadMessage
    await queryRunner.createForeignKey(
      'thread_messages',
      new TableForeignKey({
        columnNames: ['threadId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'threads',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'thread_messages',
      new TableForeignKey({
        columnNames: ['senderId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for ThreadMessage
    await queryRunner.createIndex(
      'thread_messages',
      new TableIndex({
        name: 'IDX_THREAD_MESSAGES_THREAD_ID',
        columnNames: ['threadId'],
      }),
    );
    await queryRunner.createIndex(
      'thread_messages',
      new TableIndex({
        name: 'IDX_THREAD_MESSAGES_SENDER_ID',
        columnNames: ['senderId'],
      }),
    );
    await queryRunner.createIndex(
      'thread_messages',
      new TableIndex({
        name: 'IDX_THREAD_MESSAGES_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign keys)
    await queryRunner.dropTable('thread_messages', true);
    await queryRunner.dropTable('messages', true);
    await queryRunner.dropTable('files', true);

    // Remove the foreign key we added to thread_participants
    await queryRunner.query(
      `ALTER TABLE "thread_participants" DROP CONSTRAINT IF EXISTS "FK_thread_participants_thread_id"`,
    );

    await queryRunner.dropTable('threads', true);
    await queryRunner.dropTable('chatroom_members', true);
    await queryRunner.dropTable('chatrooms', true);
  }
}

