/**
 * EcoTrack Authentication Engine v2
 * SHA-256 password hashing + 30-minute session expiry.
 */
import { Storage } from './storage.js';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// Demo credentials (SHA-256 of "password123")
const DEMO_CREDENTIALS = {
  username: 'demo',
  // SHA-256("password123") — verified correct 64-char hex
  passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'
};

/**
 * Hash a string using SHA-256 via Web Crypto API.
 */
async function hashPassword(password) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback for environments without Web Crypto
    return password;
  }
}

export class AuthEngine {
  constructor() {
    this.storage = new Storage();
  }

  /**
   * Attempts to log in with the provided credentials.
   * Uses SHA-256 hashing for password comparison.
   */
  async login(username, password) {
    const passwordHash = await hashPassword(password);

    if (username === DEMO_CREDENTIALS.username && passwordHash === DEMO_CREDENTIALS.passwordHash) {
      const sessionData = {
        token: `eco-session-${Date.now()}`,
        username: 'demo',
        name: 'Demo User',
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
      };
      this.storage.set('auth_session', sessionData);
      return { success: true };
    }

    // Small artificial delay to prevent brute-force timing attacks
    await new Promise(r => setTimeout(r, 300));
    return { success: false, error: 'Invalid username or password' };
  }

  /**
   * Logs out the current user by clearing the session.
   */
  logout() {
    this.storage.remove('auth_session');
  }

  /**
   * Checks if the user is currently authenticated.
   * Also enforces the 30-minute session expiry.
   */
  isAuthenticated() {
    const session = this.storage.get('auth_session');
    if (!session?.token) return false;

    // Check session expiry
    const now = Date.now();
    if (now - session.lastActivityAt > SESSION_TIMEOUT_MS) {
      this.logout();
      return false;
    }

    // Refresh activity timestamp (sliding expiry)
    session.lastActivityAt = now;
    this.storage.set('auth_session', session);
    return true;
  }

  /**
   * Gets the currently authenticated user's profile info.
   */
  getUser() {
    const session = this.storage.get('auth_session');
    if (!session) return null;
    return { username: session.username, name: session.name };
  }

  /**
   * Returns the session time remaining in minutes.
   */
  getSessionTimeRemaining() {
    const session = this.storage.get('auth_session');
    if (!session) return 0;
    const remaining = SESSION_TIMEOUT_MS - (Date.now() - session.lastActivityAt);
    return Math.max(0, Math.round(remaining / 60000));
  }
}
