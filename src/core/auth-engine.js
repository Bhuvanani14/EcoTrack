/**
 * EcoTrack Authentication Engine
 * Simple mock authentication system for demonstration purposes.
 */
import { Storage } from './storage.js';

export class AuthEngine {
  constructor() {
    this.storage = new Storage();
  }

  /**
   * Attempts to log in with the provided credentials.
   */
  login(username, password) {
    // Hardcoded demo credentials
    if (username === 'demo' && password === 'password123') {
      this.storage.set('auth_token', 'demo-token-12345');
      this.storage.set('auth_user', { username: 'demo', name: 'Demo User' });
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  }

  /**
   * Logs out the current user by clearing auth tokens.
   */
  logout() {
    this.storage.remove('auth_token');
    this.storage.remove('auth_user');
  }

  /**
   * Checks if the user is currently authenticated.
   */
  isAuthenticated() {
    return !!this.storage.get('auth_token');
  }

  /**
   * Gets the currently authenticated user's profile info.
   */
  getUser() {
    return this.storage.get('auth_user');
  }
}
