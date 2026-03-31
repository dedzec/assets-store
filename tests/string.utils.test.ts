import { describe, it, expect } from 'vitest';
import { escapeHtml, truncate, capitalize, toKebabCase } from '../src/utils/string.utils';

describe('escapeHtml', () => {
  it('escapes & < > " \'', () => {
    expect(escapeHtml('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&#039;');
  });

  it('returns empty string unchanged', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('leaves safe text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });

  it('handles mixed content', () => {
    expect(escapeHtml('<h1>Title & "Info"</h1>')).toBe(
      '&lt;h1&gt;Title &amp; &quot;Info&quot;&lt;/h1&gt;',
    );
  });
});

describe('truncate', () => {
  it('truncates long text with ellipsis', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcde...');
  });

  it('returns short text unchanged', () => {
    expect(truncate('abc', 5)).toBe('abc');
  });

  it('returns text at exact length unchanged', () => {
    expect(truncate('abcde', 5)).toBe('abcde');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('handles single character', () => {
    expect(capitalize('h')).toBe('H');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('leaves already capitalized text unchanged', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });
});

describe('toKebabCase', () => {
  it('converts camelCase to kebab-case', () => {
    expect(toKebabCase('helloWorld')).toBe('hello-world');
  });

  it('converts spaces to dashes', () => {
    expect(toKebabCase('hello world')).toBe('hello-world');
  });

  it('converts underscores to dashes', () => {
    expect(toKebabCase('hello_world')).toBe('hello-world');
  });

  it('converts PascalCase to kebab-case', () => {
    expect(toKebabCase('HelloWorld')).toBe('hello-world');
  });
});
