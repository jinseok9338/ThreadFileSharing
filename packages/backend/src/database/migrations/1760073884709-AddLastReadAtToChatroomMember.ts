import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastReadAtToChatroomMember1760073884709 implements MigrationInterface {
    name = 'AddLastReadAtToChatroomMember1760073884709'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP CONSTRAINT "FK_00055abbeb83a83ba412257fd8c"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP CONSTRAINT "FK_9955c6fc3e8c37d502265ce846d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_949ca0615dd0fec6147bd20503"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_29f9fd9e0c0c432e1b246292e6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d12b21996dce25ab816deffe57"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP COLUMN "invitedByUserId"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."company_invitations_role_enum"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP COLUMN "acceptedAt"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP CONSTRAINT "UQ_d12b21996dce25ab816deffe573"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP COLUMN "token"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD "invitedByUserId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD "role" "public"."company_invitations_role_enum" NOT NULL DEFAULT 'member'`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD "token" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD CONSTRAINT "UQ_d12b21996dce25ab816deffe573" UNIQUE ("token")`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD "acceptedAt" TIMESTAMP`);
        await queryRunner.query(`CREATE TYPE "public"."company_invitations_companyrole_enum" AS ENUM('owner', 'admin', 'member')`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD "companyRole" "public"."company_invitations_companyrole_enum" NOT NULL DEFAULT 'member'`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD "invitationToken" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD "invitedBy" uuid`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TYPE "public"."company_invitations_status_enum" RENAME TO "company_invitations_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."company_invitations_status_enum" AS ENUM('pending', 'accepted', 'declined', 'expired')`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ALTER COLUMN "status" TYPE "public"."company_invitations_status_enum" USING "status"::"text"::"public"."company_invitations_status_enum"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."company_invitations_status_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_949ca0615dd0fec6147bd20503" ON "company_invitations" ("expiresAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_29f9fd9e0c0c432e1b246292e6" ON "company_invitations" ("companyId", "email", "status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d12b21996dce25ab816deffe57" ON "company_invitations" ("token") `);
        await queryRunner.query(`CREATE INDEX "IDX_b17ece011731d382257720d39f" ON "company_invitations" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_265e3e740b00f6ba3f5f3ccb0c" ON "company_invitations" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_9955c6fc3e8c37d502265ce846" ON "company_invitations" ("companyId") `);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD CONSTRAINT "FK_9955c6fc3e8c37d502265ce846d" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD CONSTRAINT "FK_00055abbeb83a83ba412257fd8c" FOREIGN KEY ("invitedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD CONSTRAINT "FK_888027e25f3cd96aca2b013e6d3" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP CONSTRAINT "FK_888027e25f3cd96aca2b013e6d3"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP CONSTRAINT "FK_00055abbeb83a83ba412257fd8c"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP CONSTRAINT "FK_9955c6fc3e8c37d502265ce846d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9955c6fc3e8c37d502265ce846"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_265e3e740b00f6ba3f5f3ccb0c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b17ece011731d382257720d39f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d12b21996dce25ab816deffe57"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_29f9fd9e0c0c432e1b246292e6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_949ca0615dd0fec6147bd20503"`);
        await queryRunner.query(`CREATE TYPE "public"."company_invitations_status_enum_old" AS ENUM('pending', 'accepted', 'expired', 'revoked')`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ALTER COLUMN "status" TYPE "public"."company_invitations_status_enum_old" USING "status"::"text"::"public"."company_invitations_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."company_invitations_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."company_invitations_status_enum_old" RENAME TO "company_invitations_status_enum"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP COLUMN "invitedBy"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP COLUMN "invitationToken"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP COLUMN "companyRole"`);
        await queryRunner.query(`DROP TYPE "public"."company_invitations_companyrole_enum"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP COLUMN "acceptedAt"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP CONSTRAINT "UQ_d12b21996dce25ab816deffe573"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP COLUMN "token"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" DROP COLUMN "invitedByUserId"`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD "token" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD CONSTRAINT "UQ_d12b21996dce25ab816deffe573" UNIQUE ("token")`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD "acceptedAt" TIMESTAMP`);
        await queryRunner.query(`CREATE TYPE "public"."company_invitations_role_enum" AS ENUM('admin', 'member')`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD "role" "public"."company_invitations_role_enum" NOT NULL DEFAULT 'member'`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD "invitedByUserId" uuid NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d12b21996dce25ab816deffe57" ON "company_invitations" ("token") `);
        await queryRunner.query(`CREATE INDEX "IDX_29f9fd9e0c0c432e1b246292e6" ON "company_invitations" ("companyId", "email", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_949ca0615dd0fec6147bd20503" ON "company_invitations" ("expiresAt") `);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD CONSTRAINT "FK_9955c6fc3e8c37d502265ce846d" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company_invitations" ADD CONSTRAINT "FK_00055abbeb83a83ba412257fd8c" FOREIGN KEY ("invitedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
