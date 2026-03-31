import { describe, it, expect } from 'vitest';
import { formatDate } from '../src/utils/date.utils';

describe('formatDate', () => {
  it('formats date in pt-BR locale', () => {
    const result = formatDate('2025-06-15T10:30:00Z', 'pt-BR');
    expect(result).toContain('15');
    expect(result).toContain('06');
    expect(result).toContain('2025');
  });

  it('formats date in en-US locale', () => {
    const result = formatDate('2025-06-15T10:30:00Z', 'en-US');
    expect(result).toContain('06');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });

  it('uses pt-BR as default locale', () => {
    const result = formatDate('2025-06-15T12:00:00Z');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });

  it('accepts custom format options', () => {
    const result = formatDate('2025-06-15T10:30:00Z', 'en-US', {
      year: 'numeric',
      month: 'long',
    });
    expect(result).toContain('June');
    expect(result).toContain('2025');
  });
});
