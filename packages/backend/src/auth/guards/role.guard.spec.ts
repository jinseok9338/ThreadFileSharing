import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from './role.guard';
import { CompanyRole } from '../../user/entities/user.entity';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RoleGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if user has required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([CompanyRole.ADMIN, CompanyRole.OWNER]);

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-uuid',
            companyRole: CompanyRole.OWNER,
          },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    const canActivate = guard.canActivate(mockExecutionContext);

    expect(canActivate).toBe(true);
  });

  it('should deny access if user lacks required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([CompanyRole.OWNER]);

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-uuid',
            companyRole: CompanyRole.MEMBER,
          },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockExecutionContext)).toThrow(
      ForbiddenException,
    );
  });

  it('should allow access if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-uuid',
            companyRole: CompanyRole.MEMBER,
          },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    const canActivate = guard.canActivate(mockExecutionContext);

    expect(canActivate).toBe(true);
  });
});
