/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Storage } from '../src/core/storage.js';

describe('Storage Engine', () => {
  let storage;

  beforeEach(() => {
    localStorage.clear();
    storage = new Storage();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with correct version', () => {
    expect(storage.get('_version')).toBe(1);
  });

  it('should set and get items', () => {
    storage.set('test_key', { foo: 'bar' });
    const result = storage.get('test_key');
    expect(result.foo).toBe('bar');
  });

  it('should sanitize stored strings', () => {
    storage.set('xss', '<script>alert()</script>');
    const result = storage.get('xss');
    expect(result).toBe('&lt;script&gt;alert()&lt;&#x2F;script&gt;');
  });

  it('should remove items', () => {
    storage.set('test_key', 123);
    storage.remove('test_key');
    expect(storage.get('test_key')).toBeNull();
  });

  it('should clear only app specific items', () => {
    localStorage.setItem('other_app', 'value');
    storage.set('test_key', 123);
    storage.clear();
    expect(storage.get('test_key')).toBeNull();
    expect(localStorage.getItem('other_app')).toBe('value');
  });

  it('should export data', () => {
    storage.set('test_key', 'val');
    const exported = storage.exportData();
    expect(exported.version).toBe(1);
    expect(exported.data.test_key).toBe('val');
  });

  it('should import valid data', () => {
    const payload = JSON.stringify({
      version: 1,
      exportDate: new Date().toISOString(),
      data: {
        'imported': 'success'
      }
    });
    const result = storage.importData(payload);
    expect(result).toBe(true);
    expect(storage.get('imported')).toBe('success');
  });

  it('should fail on invalid import data', () => {
    expect(storage.importData('invalid json')).toBe(false);
    expect(storage.importData('["array"]')).toBe(false);
    expect(storage.importData(null)).toBe(false);
  });
});
