import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// 简化的认证 Hook 用于测试
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

function useAuth() {
  const [authState, setAuthState] = React.useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  const login = (user: User, token: string) => {
    localStorage.setItem('token', token);
    setAuthState({
      user,
      token,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
}

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logs in user successfully', () => {
    const { result } = renderHook(() => useAuth());

    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    };
    const mockToken = 'test-token-123';

    act(() => {
      result.current.login(mockUser, mockToken);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('stores token in localStorage on login', () => {
    const { result } = renderHook(() => useAuth());

    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    };
    const mockToken = 'test-token-123';

    act(() => {
      result.current.login(mockUser, mockToken);
    });

    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  it('logs out user successfully', () => {
    const { result } = renderHook(() => useAuth());

    // 先登录
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    };

    act(() => {
      result.current.login(mockUser, 'test-token');
    });

    // 然后登出
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('removes token from localStorage on logout', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login(
        { id: '1', email: 'test@example.com', name: 'Test' },
        'test-token'
      );
    });

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem('token')).toBeNull();
  });
});
