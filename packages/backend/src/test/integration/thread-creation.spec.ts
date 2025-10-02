import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';
import { ChatRoom } from '../../chatroom/entities/chatroom.entity';
import { Thread } from '../../thread/entities/thread.entity';
import { File } from '../../file/entities/file.entity';
import { CompanyRole } from '../../constants/permissions';

describe('Thread Creation Integration (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;
  let chatRoomRepository: Repository<ChatRoom>;
  let threadRepository: Repository<Thread>;
  let fileRepository: Repository<File>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Company, ChatRoom, Thread, File],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get('UserRepository');
    companyRepository = moduleFixture.get('CompanyRepository');
    chatRoomRepository = moduleFixture.get('ChatRoomRepository');
    threadRepository = moduleFixture.get('ThreadRepository');
    fileRepository = moduleFixture.get('FileRepository');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await fileRepository.clear();
    await threadRepository.clear();
    await chatRoomRepository.clear();
    await userRepository.clear();
    await companyRepository.clear();
  });

  describe('POST /api/v1/threads', () => {
    it('should create thread when user uploads file', async () => {
      // Create company
      const company = await companyRepository.save({
        name: 'Test Company',
        slug: 'test-company',
        storageLimitGb: 50,
        storageUsedBytes: BigInt(0),
      });

      // Create user
      const user = await userRepository.save({
        email: 'user@test.com',
        password: 'hashedpassword',
        companyId: company.id,
        companyRole: CompanyRole.MEMBER,
        emailVerified: true,
        isActive: true,
      });

      // Create chatroom
      const chatRoom = await chatRoomRepository.save({
        name: 'Test ChatRoom',
        companyId: company.id,
        createdBy: user.id,
        isPrivate: false,
      });

      // Mock authentication
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password',
        });

      const accessToken = loginResponse.body.accessToken;

      // Upload file first
      const fileUploadResponse = await request(app.getHttpServer())
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('test file content'), 'test.txt')
        .field('chatroomId', chatRoom.id)
        .field('action', 'CREATE_THREAD')
        .expect(201);

      const fileId = fileUploadResponse.body.id;

      // Create thread with file
      const threadData = {
        chatroomId: chatRoom.id,
        title: 'Test Thread',
        description: 'A test thread',
        fileId: fileId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(threadData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: threadData.title,
        description: threadData.description,
        chatroomId: chatRoom.id,
        createdBy: user.id,
        isArchived: false,
      });

      // Verify thread was saved to database
      const savedThread = await threadRepository.findOne({
        where: { id: response.body.id },
      });
      expect(savedThread).toBeTruthy();
      expect(savedThread?.title).toBe(threadData.title);
    });

    it('should create thread without file', async () => {
      // Create company
      const company = await companyRepository.save({
        name: 'Test Company',
        slug: 'test-company',
        storageLimitGb: 50,
        storageUsedBytes: BigInt(0),
      });

      // Create user
      const user = await userRepository.save({
        email: 'user@test.com',
        password: 'hashedpassword',
        companyId: company.id,
        companyRole: CompanyRole.MEMBER,
        emailVerified: true,
        isActive: true,
      });

      // Create chatroom
      const chatRoom = await chatRoomRepository.save({
        name: 'Test ChatRoom',
        companyId: company.id,
        createdBy: user.id,
        isPrivate: false,
      });

      // Mock authentication
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password',
        });

      const accessToken = loginResponse.body.accessToken;

      // Create thread without file
      const threadData = {
        chatroomId: chatRoom.id,
        title: 'Test Thread',
        description: 'A test thread without file',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(threadData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: threadData.title,
        description: threadData.description,
        chatroomId: chatRoom.id,
        createdBy: user.id,
        isArchived: false,
      });
    });

    it('should fail when user is not member of chatroom', async () => {
      // Create company
      const company = await companyRepository.save({
        name: 'Test Company',
        slug: 'test-company',
        storageLimitGb: 50,
        storageUsedBytes: BigInt(0),
      });

      // Create user
      const user = await userRepository.save({
        email: 'user@test.com',
        password: 'hashedpassword',
        companyId: company.id,
        companyRole: CompanyRole.MEMBER,
        emailVerified: true,
        isActive: true,
      });

      // Create chatroom (user is not a member)
      const chatRoom = await chatRoomRepository.save({
        name: 'Test ChatRoom',
        companyId: company.id,
        createdBy: 'different-user-id',
        isPrivate: true,
      });

      // Mock authentication
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password',
        });

      const accessToken = loginResponse.body.accessToken;

      // Attempt to create thread
      const threadData = {
        chatroomId: chatRoom.id,
        title: 'Test Thread',
        description: 'A test thread',
      };

      await request(app.getHttpServer())
        .post('/api/v1/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(threadData)
        .expect(403); // Forbidden
    });

    it('should validate required fields', async () => {
      // Create company and user
      const company = await companyRepository.save({
        name: 'Test Company',
        slug: 'test-company',
        storageLimitGb: 50,
        storageUsedBytes: BigInt(0),
      });

      const user = await userRepository.save({
        email: 'user@test.com',
        password: 'hashedpassword',
        companyId: company.id,
        companyRole: CompanyRole.MEMBER,
        emailVerified: true,
        isActive: true,
      });

      // Mock authentication
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password',
        });

      const accessToken = loginResponse.body.accessToken;

      // Attempt to create thread without required fields
      await request(app.getHttpServer())
        .post('/api/v1/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({}) // Empty data
        .expect(400); // Bad Request
    });
  });
});
