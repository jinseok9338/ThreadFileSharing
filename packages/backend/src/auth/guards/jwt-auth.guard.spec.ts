import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow request with valid JWT', () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-uuid',
            email: 'test@example.com',
            companyId: 'company-uuid',
            companyRole: 'owner',
          },
        }),
      }),
    } as ExecutionContext;

    const canActivate = guard.canActivate(mockExecutionContext);

    expect(canActivate).toBeTruthy();
  });
});
