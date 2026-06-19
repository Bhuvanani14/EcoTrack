import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthEngine } from '../src/core/auth-engine.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (index) => Object.keys(store)[index] || null,
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('AuthEngine', () => {
  let auth;

  beforeEach(() => {
    localStorageMock.clear();
    auth = new AuthEngine();
  });

  it('should authenticate demo user with correct credentials', async () => {
    const result = await auth.login('demo', 'password123');
    expect(result.success).toBe(true);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.getUser()).toEqual({ username: 'demo', name: 'Demo User' });
  });

  it('should reject incorrect credentials', async () => {
    const result = await auth.login('demo', 'wrongpassword');
    expect(result.success).toBe(false);
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.getUser()).toBeNull();
  });

  it('should reject wrong username', async () => {
    const result = await auth.login('admin', 'password123');
    expect(result.success).toBe(false);
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('should handle logout correctly', async () => {
    await auth.login('demo', 'password123');
    expect(auth.isAuthenticated()).toBe(true);
    auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.getUser()).toBeNull();
  });

  it('should support session expiry after timeout', async () => {
    // Authenticate
    await auth.login('demo', 'password123');
    expect(auth.isAuthenticated()).toBe(true);

    // Mock time passage past 30 minutes
    const futureTime = Date.now() + 31 * 60 * 1000;
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(futureTime);

    expect(auth.isAuthenticated()).toBe(false); // Should expire
    dateSpy.mockRestore();
  });

  it('should refresh lastActivityAt on access (sliding expiration)', async () => {
    const time1 = Date.now();
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(time1);

    await auth.login('demo', 'password123');
    expect(auth.isAuthenticated()).toBe(true);

    // Mock time passage by 15 minutes
    const time2 = time1 + 15 * 60 * 1000;
    dateSpy.mockReturnValue(time2);
    
    // Check authenticity - this should refresh the sliding expiration to time2
    expect(auth.isAuthenticated()).toBe(true);
    
    // Mock time passage by another 20 minutes (total 35 mins from start, but only 20 mins from last activity)
    const time3 = time2 + 20 * 60 * 1000;
    dateSpy.mockReturnValue(time3);
    
    // Should still be authenticated because of sliding expiration refresh
    expect(auth.isAuthenticated()).toBe(true);
    
    dateSpy.mockRestore();
  });
});
