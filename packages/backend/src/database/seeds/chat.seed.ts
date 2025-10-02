import { DataSource } from 'typeorm';

export async function seedChatData(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('💬 Starting chat seed data...');

    // 1. Create ChatRooms for Acme Corp
    console.log('🏢 Creating chatrooms for Acme Corp...');
    const acmeChatRooms = [
      {
        id: '00000000-0000-0000-0000-000000001001',
        companyId: '00000000-0000-0000-0000-000000000001', // Acme Corp
        name: 'General Discussion',
        description: 'General company discussions and announcements',
        isPrivate: false,
        createdBy: '00000000-0000-0000-0000-000000000101', // Alice (owner)
        memberCount: 4,
      },
      {
        id: '00000000-0000-0000-0000-000000001002',
        companyId: '00000000-0000-0000-0000-000000000001', // Acme Corp
        name: 'Development Team',
        description: 'Development discussions and code reviews',
        isPrivate: true,
        createdBy: '00000000-0000-0000-0000-000000000102', // Bob (admin)
        memberCount: 3,
      },
      {
        id: '00000000-0000-0000-0000-000000001003',
        companyId: '00000000-0000-0000-0000-000000000001', // Acme Corp
        name: 'Project Alpha',
        description: 'Project Alpha planning and updates',
        isPrivate: false,
        createdBy: '00000000-0000-0000-0000-000000000101', // Alice (owner)
        memberCount: 2,
      },
    ];

    for (const chatRoom of acmeChatRooms) {
      await queryRunner.query(
        `INSERT INTO chatrooms (id, "companyId", name, description, "isPrivate", "createdBy", "memberCount", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          chatRoom.id,
          chatRoom.companyId,
          chatRoom.name,
          chatRoom.description,
          chatRoom.isPrivate,
          chatRoom.createdBy,
          chatRoom.memberCount,
        ],
      );
    }

    // 2. Create ChatRoom Members for Acme Corp
    console.log('👥 Creating chatroom members...');
    const acmeMembers = [
      // General Discussion - all members
      {
        chatroomId: '00000000-0000-0000-0000-000000001001',
        userId: '00000000-0000-0000-0000-000000000101', // Alice
      },
      {
        chatroomId: '00000000-0000-0000-0000-000000001001',
        userId: '00000000-0000-0000-0000-000000000102', // Bob
      },
      {
        chatroomId: '00000000-0000-0000-0000-000000001001',
        userId: '00000000-0000-0000-0000-000000000103', // Charlie
      },
      {
        chatroomId: '00000000-0000-0000-0000-000000001001',
        userId: '00000000-0000-0000-0000-000000000104', // Diana
      },
      // Development Team - only developers
      {
        chatroomId: '00000000-0000-0000-0000-000000001002',
        userId: '00000000-0000-0000-0000-000000000102', // Bob
      },
      {
        chatroomId: '00000000-0000-0000-0000-000000001002',
        userId: '00000000-0000-0000-0000-000000000103', // Charlie
      },
      {
        chatroomId: '00000000-0000-0000-0000-000000001002',
        userId: '00000000-0000-0000-0000-000000000104', // Diana
      },
      // Project Alpha - project members
      {
        chatroomId: '00000000-0000-0000-0000-000000001003',
        userId: '00000000-0000-0000-0000-000000000101', // Alice
      },
      {
        chatroomId: '00000000-0000-0000-0000-000000001003',
        userId: '00000000-0000-0000-0000-000000000102', // Bob
      },
    ];

    for (const member of acmeMembers) {
      await queryRunner.query(
        `INSERT INTO chatroom_members ("chatroomId", "userId", "joinedAt")
         VALUES ($1, $2, NOW())
         ON CONFLICT ("chatroomId", "userId") DO NOTHING`,
        [member.chatroomId, member.userId],
      );
    }

    // 3. Create Threads
    console.log('🧵 Creating threads...');
    const threads = [
      {
        id: '00000000-0000-0000-0000-000000002001',
        chatroomId: '00000000-0000-0000-0000-000000001001', // General Discussion
        title: 'Welcome to the Team!',
        description: 'Introductions and getting to know each other',
        createdBy: '00000000-0000-0000-0000-000000000101', // Alice
        isArchived: false,
        participantCount: 4,
        fileCount: 0,
      },
      {
        id: '00000000-0000-0000-0000-000000002002',
        chatroomId: '00000000-0000-0000-0000-000000001001', // General Discussion
        title: 'Q4 Planning Meeting Notes',
        description: 'Notes from our Q4 planning meeting',
        createdBy: '00000000-0000-0000-0000-000000000101', // Alice
        isArchived: false,
        participantCount: 4,
        fileCount: 2,
      },
      {
        id: '00000000-0000-0000-0000-000000002003',
        chatroomId: '00000000-0000-0000-0000-000000001002', // Development Team
        title: 'Code Review Guidelines',
        description: 'Our team code review process and best practices',
        createdBy: '00000000-0000-0000-0000-000000000102', // Bob
        isArchived: false,
        participantCount: 3,
        fileCount: 1,
      },
      {
        id: '00000000-0000-0000-0000-000000002004',
        chatroomId: '00000000-0000-0000-0000-000000001003', // Project Alpha
        title: 'Project Requirements Document',
        description: 'Initial requirements and specifications',
        createdBy: '00000000-0000-0000-0000-000000000101', // Alice
        isArchived: false,
        participantCount: 2,
        fileCount: 3,
      },
    ];

    for (const thread of threads) {
      await queryRunner.query(
        `INSERT INTO threads (id, "chatroomId", title, description, "createdBy", "isArchived", "participantCount", "fileCount", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          thread.id,
          thread.chatroomId,
          thread.title,
          thread.description,
          thread.createdBy,
          thread.isArchived,
          thread.participantCount,
          thread.fileCount,
        ],
      );
    }

    // 4. Create Thread Participants
    console.log('👥 Creating thread participants...');
    const threadParticipants = [
      // Welcome thread - all general discussion members
      {
        threadId: '00000000-0000-0000-0000-000000002001',
        userId: '00000000-0000-0000-0000-000000000101', // Alice
        role: 'owner',
      },
      {
        threadId: '00000000-0000-0000-0000-000000002001',
        userId: '00000000-0000-0000-0000-000000000102', // Bob
        role: 'member',
      },
      {
        threadId: '00000000-0000-0000-0000-000000002001',
        userId: '00000000-0000-0000-0000-000000000103', // Charlie
        role: 'member',
      },
      {
        threadId: '00000000-0000-0000-0000-000000002001',
        userId: '00000000-0000-0000-0000-000000000104', // Diana
        role: 'member',
      },
      // Q4 Planning thread - all general discussion members
      {
        threadId: '00000000-0000-0000-0000-000000002002',
        userId: '00000000-0000-0000-0000-000000000101', // Alice
        role: 'owner',
      },
      {
        threadId: '00000000-0000-0000-0000-000000002002',
        userId: '00000000-0000-0000-0000-000000000102', // Bob
        role: 'member',
      },
      {
        threadId: '00000000-0000-0000-0000-000000002002',
        userId: '00000000-0000-0000-0000-000000000103', // Charlie
        role: 'member',
      },
      {
        threadId: '00000000-0000-0000-0000-000000002002',
        userId: '00000000-0000-0000-0000-000000000104', // Diana
        role: 'member',
      },
      // Code Review Guidelines - development team members
      {
        threadId: '00000000-0000-0000-0000-000000002003',
        userId: '00000000-0000-0000-0000-000000000102', // Bob
        role: 'owner',
      },
      {
        threadId: '00000000-0000-0000-0000-000000002003',
        userId: '00000000-0000-0000-0000-000000000103', // Charlie
        role: 'member',
      },
      {
        threadId: '00000000-0000-0000-0000-000000002003',
        userId: '00000000-0000-0000-0000-000000000104', // Diana
        role: 'member',
      },
      // Project Requirements - project members
      {
        threadId: '00000000-0000-0000-0000-000000002004',
        userId: '00000000-0000-0000-0000-000000000101', // Alice
        role: 'owner',
      },
      {
        threadId: '00000000-0000-0000-0000-000000002004',
        userId: '00000000-0000-0000-0000-000000000102', // Bob
        role: 'member',
      },
    ];

    for (const participant of threadParticipants) {
      await queryRunner.query(
        `INSERT INTO thread_participants ("threadId", "userId", role, "canUpload", "canComment", "canInvite", "joinedAt")
         VALUES ($1, $2, $3, true, true, $4, NOW())
         ON CONFLICT ("threadId", "userId") DO NOTHING`,
        [
          participant.threadId,
          participant.userId,
          participant.role,
          participant.role === 'owner', // Only owners can invite
        ],
      );
    }

    // 5. Create Sample Messages
    console.log('💭 Creating sample messages...');
    const messages = [
      {
        chatroomId: '00000000-0000-0000-0000-000000001001', // General Discussion
        senderId: '00000000-0000-0000-0000-000000000101', // Alice
        content: 'Welcome everyone to our new team chat! 🎉',
        messageType: 'TEXT',
      },
      {
        chatroomId: '00000000-0000-0000-0000-000000001001', // General Discussion
        senderId: '00000000-0000-0000-0000-000000000102', // Bob
        content: 'Thanks Alice! Looking forward to working with everyone.',
        messageType: 'TEXT',
      },
      {
        chatroomId: '00000000-0000-0000-0000-000000001002', // Development Team
        senderId: '00000000-0000-0000-0000-000000000102', // Bob
        content: "Hey team, let's discuss our code review process.",
        messageType: 'TEXT',
      },
      {
        chatroomId: '00000000-0000-0000-0000-000000001003', // Project Alpha
        senderId: '00000000-0000-0000-0000-000000000101', // Alice
        content: 'Project Alpha kickoff meeting scheduled for next Monday.',
        messageType: 'TEXT',
      },
    ];

    for (const message of messages) {
      await queryRunner.query(
        `INSERT INTO messages ("chatroomId", "senderId", content, "messageType", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [
          message.chatroomId,
          message.senderId,
          message.content,
          message.messageType,
        ],
      );
    }

    // 6. Create Sample Thread Messages
    console.log('💬 Creating sample thread messages...');
    const threadMessages = [
      {
        threadId: '00000000-0000-0000-0000-000000002001', // Welcome thread
        senderId: '00000000-0000-0000-0000-000000000101', // Alice
        content: 'Hi everyone! Please introduce yourselves in this thread.',
        messageType: 'TEXT',
      },
      {
        threadId: '00000000-0000-0000-0000-000000002001', // Welcome thread
        senderId: '00000000-0000-0000-0000-000000000103', // Charlie
        content:
          "Hi Alice! I'm Charlie, the new backend developer. Excited to be here!",
        messageType: 'TEXT',
      },
      {
        threadId: '00000000-0000-0000-0000-000000002003', // Code Review Guidelines
        senderId: '00000000-0000-0000-0000-000000000102', // Bob
        content:
          'Here are our code review guidelines. Please review and provide feedback.',
        messageType: 'TEXT',
      },
      {
        threadId: '00000000-0000-0000-0000-000000002004', // Project Requirements
        senderId: '00000000-0000-0000-0000-000000000101', // Alice
        content:
          "I've uploaded the initial requirements document. Let's discuss the scope.",
        messageType: 'TEXT',
      },
    ];

    for (const message of threadMessages) {
      await queryRunner.query(
        `INSERT INTO thread_messages ("threadId", "senderId", content, "messageType", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [
          message.threadId,
          message.senderId,
          message.content,
          message.messageType,
        ],
      );
    }

    await queryRunner.commitTransaction();
    console.log('🎉 Chat seed data completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   - ChatRooms: ${acmeChatRooms.length}`);
    console.log(`   - ChatRoom Members: ${acmeMembers.length}`);
    console.log(`   - Threads: ${threads.length}`);
    console.log(`   - Thread Participants: ${threadParticipants.length}`);
    console.log(`   - Messages: ${messages.length}`);
    console.log(`   - Thread Messages: ${threadMessages.length}`);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding chat data:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
