import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Load environment variables
config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

export async function seedAuthData(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('🌱 Starting auth seed data...');

    // Hash password once for all users
    const hashedPassword = await bcrypt.hash('Password123!', BCRYPT_ROUNDS);

    // 1. Create Companies
    console.log('📦 Creating companies...');
    const companies = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Acme Corporation',
        slug: 'acme-corp',
        plan: 'pro',
        maxUsers: 50,
        maxStorageBytes: 10737418240, // 10GB
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'TechStart Inc',
        slug: 'techstart',
        plan: 'free',
        maxUsers: 10,
        maxStorageBytes: 5368709120, // 5GB
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Anchors',
        slug: 'anchors',
        plan: 'enterprise',
        maxUsers: 100,
        maxStorageBytes: 53687091200, // 50GB
      },
    ];

    for (const company of companies) {
      await queryRunner.query(
        `INSERT INTO companies (id, name, slug, plan, "maxUsers", "maxStorageBytes", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          company.id,
          company.name,
          company.slug,
          company.plan,
          company.maxUsers,
          company.maxStorageBytes,
        ],
      );
    }
    console.log(`✅ Created ${companies.length} companies`);

    // 2. Create Users for Acme Corp
    console.log('👥 Creating users for Acme Corp...');
    const acmeUsers = [
      {
        id: '00000000-0000-0000-0000-000000000101',
        email: 'alice.owner@acme-corp.com',
        username: 'alice',
        fullName: 'Alice Johnson',
        companyId: companies[0].id,
        companyRole: 'owner',
      },
      {
        id: '00000000-0000-0000-0000-000000000102',
        email: 'bob.admin@acme-corp.com',
        username: 'bob',
        fullName: 'Bob Smith',
        companyId: companies[0].id,
        companyRole: 'admin',
      },
      {
        id: '00000000-0000-0000-0000-000000000103',
        email: 'charlie.member@acme-corp.com',
        username: 'charlie',
        fullName: 'Charlie Brown',
        companyId: companies[0].id,
        companyRole: 'member',
      },
      {
        id: '00000000-0000-0000-0000-000000000104',
        email: 'diana.member@acme-corp.com',
        username: 'diana',
        fullName: 'Diana Prince',
        companyId: companies[0].id,
        companyRole: 'member',
      },
    ];

    // 3. Create Users for TechStart
    console.log('👥 Creating users for TechStart...');
    const techstartUsers = [
      {
        id: '00000000-0000-0000-0000-000000000201',
        email: 'eve.owner@techstart.com',
        username: 'eve',
        fullName: 'Eve Anderson',
        companyId: companies[1].id,
        companyRole: 'owner',
      },
      {
        id: '00000000-0000-0000-0000-000000000202',
        email: 'frank.admin@techstart.com',
        username: 'frank',
        fullName: 'Frank Miller',
        companyId: companies[1].id,
        companyRole: 'admin',
      },
      {
        id: '00000000-0000-0000-0000-000000000203',
        email: 'grace.member@techstart.com',
        username: 'grace',
        fullName: 'Grace Lee',
        companyId: companies[1].id,
        companyRole: 'member',
      },
      {
        id: '00000000-0000-0000-0000-000000000204',
        email: 'henry.member@techstart.com',
        username: 'henry',
        fullName: 'Henry Wilson',
        companyId: companies[1].id,
        companyRole: 'member',
      },
    ];

    // 4. Create Users for Anchors
    console.log('👥 Creating users for Anchors...');
    const anchorsUsers = [
      {
        id: '00000000-0000-0000-0000-000000000301',
        email: 'jinseok9338@gmail.com',
        username: 'jinseok',
        fullName: 'Jinseok Seo',
        companyId: companies[2].id,
        companyRole: 'owner',
      },
      {
        id: '00000000-0000-0000-0000-000000000302',
        email: 'jsseo@anchors-biz.com',
        username: 'jsseo',
        fullName: 'JS Seo',
        companyId: companies[2].id,
        companyRole: 'admin',
      },
    ];

    const allUsers = [...acmeUsers, ...techstartUsers, ...anchorsUsers];
    for (const user of allUsers) {
      await queryRunner.query(
        `INSERT INTO users (id, "companyId", email, username, "fullName", password, "companyRole", "emailVerified", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          user.id,
          user.companyId,
          user.email,
          user.username,
          user.fullName,
          hashedPassword,
          user.companyRole,
        ],
      );
    }
    console.log(`✅ Created ${allUsers.length} users`);

    // 5. Create Invitations
    console.log('✉️  Creating invitations...');
    const invitations = [
      {
        id: '00000000-0000-0000-0000-000000000301',
        companyId: companies[0].id,
        invitedByUserId: acmeUsers[0].id, // Alice (owner)
        email: 'isaac.invited@acme-corp.com',
        role: 'member',
        token: 'acme-invitation-token-001',
        status: 'pending',
      },
      {
        id: '00000000-0000-0000-0000-000000000302',
        companyId: companies[0].id,
        invitedByUserId: acmeUsers[1].id, // Bob (admin)
        email: 'julia.invited@acme-corp.com',
        role: 'admin',
        token: 'acme-invitation-token-002',
        status: 'pending',
      },
      {
        id: '00000000-0000-0000-0000-000000000401',
        companyId: companies[1].id,
        invitedByUserId: techstartUsers[0].id, // Eve (owner)
        email: 'kate.invited@techstart.com',
        role: 'member',
        token: 'techstart-invitation-token-001',
        status: 'pending',
      },
      {
        id: '00000000-0000-0000-0000-000000000402',
        companyId: companies[1].id,
        invitedByUserId: techstartUsers[1].id, // Frank (admin)
        email: 'leo.invited@techstart.com',
        role: 'admin',
        token: 'techstart-invitation-token-002',
        status: 'pending',
      },
    ];

    for (const invitation of invitations) {
      await queryRunner.query(
        `INSERT INTO company_invitations (id, "companyId", "invitedByUserId", email, role, token, "expiresAt", status, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '7 days', $7, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          invitation.id,
          invitation.companyId,
          invitation.invitedByUserId,
          invitation.email,
          invitation.role,
          invitation.token,
          invitation.status,
        ],
      );
    }
    console.log(`✅ Created ${invitations.length} invitations`);

    await queryRunner.commitTransaction();
    console.log('🎉 Auth seed data completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   - Companies: ${companies.length}`);
    console.log(`   - Users: ${allUsers.length}`);
    console.log(`   - Invitations: ${invitations.length}`);
    console.log('');
    console.log('🔑 Test Credentials (all users):');
    console.log('   Password: Password123!');
    console.log('');
    console.log('👤 Sample Users:');
    console.log('   Acme Corp Owner: alice.owner@acme-corp.com');
    console.log('   TechStart Owner: eve.owner@techstart.com');
    console.log('   Anchors Owner: jinseok9338@gmail.com');
    console.log('   Anchors Admin: jsseo@anchors-biz.com');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding auth data:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
