import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CompanyGuard } from './company.guard';

describe('CompanyGuard', () => {
  let guard: CompanyGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new CompanyGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if user belongs to same company', () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-uuid',
            companyId: 'company-uuid',
          },
          params: {
            companyId: 'company-uuid',
          },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    const canActivate = guard.canActivate(mockExecutionContext);

    expect(canActivate).toBe(true);
  });

  it('should deny access if user belongs to different company', () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-uuid',
            companyId: 'company-uuid-1',
          },
          params: {
            companyId: 'company-uuid-2',
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
});
