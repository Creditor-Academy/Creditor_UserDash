import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as userService from '../userService';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('User Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getUserRole', () => {
    it('should return default role "user" when no role is set', () => {
      const role = userService.getUserRole();
      expect(role).toBe('user');
    });

    it('should return stored role', () => {
      localStorageMock.setItem('userRole', 'instructor');
      const role = userService.getUserRole();
      expect(role).toBe('instructor');
    });
  });

  describe('getUserRoles', () => {
    it('should return default roles array when no roles are set', () => {
      const roles = userService.getUserRoles();
      expect(roles).toEqual(['user']);
    });

    it('should return stored roles array', () => {
      localStorageMock.setItem(
        'userRoles',
        JSON.stringify(['instructor', 'admin'])
      );
      const roles = userService.getUserRoles();
      expect(roles).toEqual(['instructor', 'admin']);
    });
  });

  describe('setUserRole', () => {
    it('should set user role and update roles array', () => {
      const role = 'instructor';
      userService.setUserRole(role);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('userRole', role);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userRoles',
        JSON.stringify([role])
      );
    });

    it('should dispatch userRoleChanged event', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      userService.setUserRole('admin');

      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
      dispatchSpy.mockRestore();
    });
  });

  describe('setUserRoles', () => {
    it('should set single role from array', () => {
      const roles = ['instructor'];
      userService.setUserRoles(roles);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userRoles',
        JSON.stringify(['instructor'])
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userRole',
        'instructor'
      );
    });

    it('should store all roles and use priority when multiple roles provided', () => {
      const roles = ['instructor', 'admin'];
      userService.setUserRoles(roles);

      // Should store all roles
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userRoles',
        JSON.stringify(['instructor', 'admin'])
      );
      // Should set primary role based on priority (admin > instructor)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userRole',
        'admin'
      );
    });

    it('should default to user role when empty array provided', () => {
      userService.setUserRoles([]);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userRoles',
        JSON.stringify(['user'])
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userRole', 'user');
    });

    it('should prioritize super_admin role over all others', () => {
      const roles = ['user', 'instructor', 'admin', 'super_admin'];
      userService.setUserRoles(roles);

      // Should store all roles
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userRoles',
        JSON.stringify(['user', 'instructor', 'admin', 'super_admin'])
      );
      // Should set primary role to super_admin (highest priority)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userRole',
        'super_admin'
      );
    });
  });

  describe('isInstructorOrAdmin', () => {
    it('should return false for regular user', () => {
      localStorageMock.setItem('userRoles', JSON.stringify(['user']));
      const result = userService.isInstructorOrAdmin();
      expect(result).toBe(false);
    });

    it('should return true for instructor', () => {
      localStorageMock.setItem('userRoles', JSON.stringify(['instructor']));
      const result = userService.isInstructorOrAdmin();
      expect(result).toBe(true);
    });

    it('should return true for admin', () => {
      localStorageMock.setItem('userRoles', JSON.stringify(['admin']));
      const result = userService.isInstructorOrAdmin();
      expect(result).toBe(true);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      localStorageMock.setItem('userRoles', JSON.stringify(['instructor']));
      const result = userService.hasRole('instructor');
      expect(result).toBe(true);
    });

    it('should return false when user does not have the role', () => {
      localStorageMock.setItem('userRoles', JSON.stringify(['user']));
      const result = userService.hasRole('instructor');
      expect(result).toBe(false);
    });
  });

  describe('setSingleRole', () => {
    it('should set valid role', () => {
      userService.setSingleRole('instructor');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userRole',
        'instructor'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'userRoles',
        JSON.stringify(['instructor'])
      );
    });

    it('should default to user for invalid role', () => {
      userService.setSingleRole('invalid-role');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('userRole', 'user');
    });

    it('should default to user when no role provided', () => {
      userService.setSingleRole(null);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('userRole', 'user');
    });
  });

  describe('clearUserData', () => {
    it('should remove user role data', () => {
      userService.clearUserData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userRole');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userRoles');
    });

    it('should dispatch userRoleChanged event', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      userService.clearUserData();

      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
      dispatchSpy.mockRestore();
    });
  });
});
