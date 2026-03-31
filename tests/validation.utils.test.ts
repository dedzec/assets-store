import { describe, it, expect } from 'vitest';
import { isValidUrl, isNotEmpty, isAllowedExtension, isFileSizeValid } from '../src/utils/validation.utils';

describe('isValidUrl', () => {
  it('returns true for valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('ftp://files.server.com/file.txt')).toBe(true);
  });

  it('returns false for invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
  });
});

describe('isNotEmpty', () => {
  it('returns true for non-empty strings', () => {
    expect(isNotEmpty('hello')).toBe(true);
    expect(isNotEmpty(' a ')).toBe(true);
  });

  it('returns false for empty or whitespace strings', () => {
    expect(isNotEmpty('')).toBe(false);
    expect(isNotEmpty('   ')).toBe(false);
    expect(isNotEmpty('\t\n')).toBe(false);
  });
});

describe('isAllowedExtension', () => {
  const allowed = ['jpg', 'png', 'gif', 'webp'];

  it('returns true for allowed extensions', () => {
    expect(isAllowedExtension('photo.jpg', allowed)).toBe(true);
    expect(isAllowedExtension('image.PNG', allowed)).toBe(true);
    expect(isAllowedExtension('test.webp', allowed)).toBe(true);
  });

  it('returns false for disallowed extensions', () => {
    expect(isAllowedExtension('file.exe', allowed)).toBe(false);
    expect(isAllowedExtension('doc.pdf', allowed)).toBe(false);
  });

  it('returns false for files without extension', () => {
    expect(isAllowedExtension('noext', allowed)).toBe(false);
  });
});

describe('isFileSizeValid', () => {
  it('returns true when size is within limit', () => {
    expect(isFileSizeValid(500, 1000)).toBe(true);
    expect(isFileSizeValid(1000, 1000)).toBe(true);
  });

  it('returns false when size exceeds limit', () => {
    expect(isFileSizeValid(1001, 1000)).toBe(false);
  });

  it('returns true for zero size', () => {
    expect(isFileSizeValid(0, 1000)).toBe(true);
  });
});
