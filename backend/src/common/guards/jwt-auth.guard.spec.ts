import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  const mockContext = (path: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          route: { path },
          url: path,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    guard = new JwtAuthGuard(reflector);
  });

  it('should allow access for @Public() routes', () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === 'isPublic') return true;
      return undefined;
    });

    const result = guard.canActivate(mockContext('/test1'));

    expect(result).toBe(true);
  });

  it('should delegate to parent for non-public routes', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const superCanActivate = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(true);

    const ctx = mockContext('/v1/users/me');
    guard.canActivate(ctx);

    expect(superCanActivate).toHaveBeenCalled();
  });

  it('should check both handler and class for @Public()', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    guard.canActivate(mockContext('/anything'));

    expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
    expect(reflector.getAllAndOverride.mock.calls[0][0]).toBe('isPublic');
  });

  it('should not allow non-public routes without valid JWT', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const superCanActivate = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(false);

    const result = guard.canActivate(mockContext('/v1/users/me'));

    expect(result).toBe(false);
  });
});
