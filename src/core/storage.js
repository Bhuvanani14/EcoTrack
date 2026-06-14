/**
 * EcoTrack Storage Layer
 * LocalStorage wrapper with sanitization, versioning, and data portability.
 */
import { sanitizeString } from '../utils/sanitize.js';

const STORAGE_PREFIX = 'ecotrack_';
const STORAGE_VERSION = 1;

export class Storage {
  constructor() {
    this._checkVersion();
  }

  get(key) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  set(key, value) {
    try {
      const sanitized = this._sanitizeValue(value);
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(sanitized));
      return true;
    } catch {
      return false;
    }
  }

  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  }

  clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  }

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

  importData(jsonString) {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
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
