import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { RoleHierarchyService } from './role-hierarchy.service';
import { User } from '../user/entities/user.entity';
import { ThreadParticipant } from '../thread/entities/thread-participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ThreadParticipant])],
  providers: [PermissionService, RoleHierarchyService],
  exports: [PermissionService, RoleHierarchyService],
})
export class PermissionModule {}
