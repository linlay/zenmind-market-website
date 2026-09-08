import { describe, expect, it } from 'vitest';
import { stripMarkdownFrontMatter } from './CatalogViews';

describe('stripMarkdownFrontMatter', () => {
  it('hides the YAML metadata header from the readable skill document', () => {
    expect(stripMarkdownFrontMatter('---\nname: Demo\ndescription: A demo skill\n---\n\n# Usage\nRun it.')).toBe('# Usage\nRun it.');
  });

  it('supports the YAML document-end marker and preserves ordinary markdown', () => {
    expect(stripMarkdownFrontMatter('---\r\nname: Demo\r\n...\r\n## Guide')).toBe('## Guide');
    expect(stripMarkdownFrontMatter('# No front matter\n\n---\nBody')).toBe('# No front matter\n\n---\nBody');
  });

  it('does not remove content when a front matter block is incomplete', () => {
    expect(stripMarkdownFrontMatter('---\nname: Demo\n# Still YAML')).toBe('---\nname: Demo\n# Still YAML');
  });
});
