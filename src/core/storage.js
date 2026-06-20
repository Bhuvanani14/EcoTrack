/**
 * EcoTrack Storage Layer
 * LocalStorage wrapper with sanitization, versioning, and data portability.
 * @module storage
 */
import { sanitizeString } from '../utils/sanitize.js';

const STORAGE_PREFIX = 'ecotrack_';
const STORAGE_VERSION = 1;

/**
 * Storage class for managing browser localStorage with built-in versioning,
 * sanitization to prevent XSS, and export/import functionality.
 */
export class Storage {
  /**
   * Initializes the storage and checks/sets the storage version.
   */
  constructor() {
    this._checkVersion();
  }

  /**
   * Retrieves and deserializes a value from storage.
   * @param {string} key - The storage key.
   * @returns {any} The parsed value or null if not found.
   */
  get(key) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Serializes and stores a value with sanitization to prevent XSS.
   * @param {string} key - The storage key.
   * @param {any} value - The value to store.
   * @returns {boolean} True if successful, false otherwise.
   */
  set(key, value) {
    try {
      const sanitized = this._sanitizeValue(value);
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(sanitized));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Removes an item from storage.
   * @param {string} key - The storage key.
   */
  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  }

  /**
   * Clears all app-specific data from storage (leaves other domain data intact).
   */
  clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  }

  /**
   * Exports all app storage data as a JSON object.
   * @returns {object} JSON representation of all data.
   */
  exportData() {
    const data = {};
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => {
        try { data[k.replace(STORAGE_PREFIX, '')] = JSON.parse(localStorage.getItem(k)); }
        catch { data[k.replace(STORAGE_PREFIX, '')] = localStorage.getItem(k); }
      });
    return { version: STORAGE_VERSION, exportDate: new Date().toISOString(), data };
  }

  /**
   * Imports data from a JSON string, validating schema before applying.
   * @param {string} jsonString - JSON string to import.
   * @returns {boolean} True if successful, false otherwise.
   */
  importData(jsonString) {
    try {
      if (jsonString.length > 500000) throw new Error('Payload too large');
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Invalid format: expected a JSON object');
      }
      if (!parsed.data || typeof parsed.data !== 'object') throw new Error('Invalid format');
      Object.entries(parsed.data).forEach(([key, value]) => {
        this.set(key, value);
      });
      return true;
    } catch {
      return false;
    }
  }

  _sanitizeValue(value) {
    if (typeof value === 'string') return sanitizeString(value);
    if (Array.isArray(value)) return value.map(v => this._sanitizeValue(v));
    if (value && typeof value === 'object') {
      const clean = {};
      Object.entries(value).forEach(([k, v]) => {
        clean[sanitizeString(k)] = this._sanitizeValue(v);
      });
      return clean;
    }
    return value;
  }

  _checkVersion() {
    const ver = this.get('_version');
    if (ver !== STORAGE_VERSION) {
      this.set('_version', STORAGE_VERSION);
    }
  }
}

/** 
 * Shared singleton instance of the Storage layer. 
 * @type {Storage}
 */
export const storage = new Storage();
