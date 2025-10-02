import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';
import { ChatRoom } from '../../chatroom/entities/chatroom.entity';
import { CompanyRole } from '../../constants/permissions';

describe('ChatRoom Creation Integration (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;
  let chatRoomRepository: Repository<ChatRoom>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Company, ChatRoom],
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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await chatRoomRepository.clear();
    await userRepository.clear();
    await companyRepository.clear();
  });

  describe('POST /api/v1/chatrooms', () => {
    it('should create chatroom when user has permission', async () => {
      // Create company
      const company = await companyRepository.save({
        name: 'Test Company',
        slug: 'test-company',
        storageLimitGb: 50,
        storageUsedBytes: BigInt(0),
      });

      // Create admin user
      const user = await userRepository.save({
        email: 'admin@test.com',
        password: 'hashedpassword',
        companyId: company.id,
        companyRole: CompanyRole.ADMIN,
        emailVerified: true,
        isActive: true,
      });

      // Mock authentication
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password',
        });

      const accessToken = loginResponse.body.accessToken;

      // Create chatroom
      const chatRoomData = {
        name: 'Test ChatRoom',
        description: 'A test chatroom',
        isPrivate: false,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/chatrooms')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(chatRoomData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: chatRoomData.name,
        description: chatRoomData.description,
        isPrivate: chatRoomData.isPrivate,
        companyId: company.id,
        createdBy: user.id,
      });

      // Verify chatroom was saved to database
      const savedChatRoom = await chatRoomRepository.findOne({
        where: { id: response.body.id },
      });
      expect(savedChatRoom).toBeTruthy();
      expect(savedChatRoom?.name).toBe(chatRoomData.name);
    });

    it('should fail when user lacks permission', async () => {
      // Create company
      const company = await companyRepository.save({
        name: 'Test Company',
        slug: 'test-company',
        storageLimitGb: 50,
        storageUsedBytes: BigInt(0),
      });

      // Create member user (no chatroom creation permission)
      const user = await userRepository.save({
        email: 'member@test.com',
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
          email: 'member@test.com',
          password: 'password',
        });

      const accessToken = loginResponse.body.accessToken;

      // Attempt to create chatroom
      const chatRoomData = {
        name: 'Test ChatRoom',
        description: 'A test chatroom',
        isPrivate: false,
      };

      await request(app.getHttpServer())
        .post('/api/v1/chatrooms')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(chatRoomData)
        .expect(403); // Forbidden
    });

    it('should fail when not authenticated', async () => {
      const chatRoomData = {
        name: 'Test ChatRoom',
        description: 'A test chatroom',
        isPrivate: false,
      };

      await request(app.getHttpServer())
        .post('/api/v1/chatrooms')
        .send(chatRoomData)
        .expect(401); // Unauthorized
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
        email: 'admin@test.com',
        password: 'hashedpassword',
        companyId: company.id,
        companyRole: CompanyRole.ADMIN,
        emailVerified: true,
        isActive: true,
      });

      // Mock authentication
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password',
        });

      const accessToken = loginResponse.body.accessToken;

      // Attempt to create chatroom without required fields
      await request(app.getHttpServer())
        .post('/api/v1/chatrooms')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({}) // Empty data
        .expect(400); // Bad Request
    });
  });
});
