import { describe, it, expect } from 'vitest';
import { escapeHtml, truncate, capitalize, toKebabCase, detectLinkType } from '../src/utils/string.utils';

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

describe('detectLinkType', () => {
  it('returns empty string for empty input', () => {
    expect(detectLinkType('')).toBe('');
    expect(detectLinkType('   ')).toBe('');
  });

  // Cloud links
  it('detects https URLs as cloud', () => {
    expect(detectLinkType('https://drive.google.com/file/abc')).toBe('cloud');
  });

  it('detects http URLs as cloud', () => {
    expect(detectLinkType('http://example.com/asset.zip')).toBe('cloud');
  });

  it('detects ftp URLs as cloud', () => {
    expect(detectLinkType('ftp://files.server.com/assets/')).toBe('cloud');
  });

  it('detects s3 URLs as cloud', () => {
    expect(detectLinkType('s3://my-bucket/assets/model.fbx')).toBe('cloud');
  });

  it('detects domain-like strings as cloud', () => {
    expect(detectLinkType('drive.google.com/shared/abc')).toBe('cloud');
    expect(detectLinkType('mega.nz/file/xyz')).toBe('cloud');
  });

  // Local links
  it('detects Unix absolute paths as local', () => {
    expect(detectLinkType('/home/user/assets/model.fbx')).toBe('local');
  });

  it('detects Windows paths as local', () => {
    expect(detectLinkType('C:\\Users\\dev\\assets\\model.fbx')).toBe('local');
    expect(detectLinkType('D:/Games/Assets/texture.png')).toBe('local');
  });

  it('detects home-relative paths as local', () => {
    expect(detectLinkType('~/Documents/assets.zip')).toBe('local');
  });

  it('detects UNC paths as local', () => {
    expect(detectLinkType('\\\\server\\share\\asset.fbx')).toBe('local');
  });

  it('detects file:// protocol as local', () => {
    expect(detectLinkType('file:///home/user/model.fbx')).toBe('local');
  });

  it('detects relative paths as local', () => {
    expect(detectLinkType('./assets/model.fbx')).toBe('local');
    expect(detectLinkType('../shared/texture.png')).toBe('local');
  });
});
