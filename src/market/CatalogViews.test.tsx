import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IncludedSkillsSection, stripMarkdownFrontMatter } from './CatalogViews';

const sectionCopy = {
  skillIncludedCount: (count: number) => `Included skills (${count})`,
  skillIncludedMore: (count: number) => `${count} more skills`,
};

function packageItem(includedSkills) {
  return {
    type: 'skill',
    skillKind: 'package',
    id: 'wecomcli-suite',
    includedSkills,
  };
}

function stubFetchResponses(responses) {
  vi.stubGlobal('fetch', vi.fn((url) => {
    const id = String(url).split('/').pop();
    const data = responses[id];
    if (!data) {
      return Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve('') });
    }
    return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(data)) });
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

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

describe('IncludedSkillsSection', () => {
  it('lists the bundled skills with their fetched descriptions', async () => {
    stubFetchResponses({
      'skill-a': { id: 'skill-a', name: 'Todo Management', description: 'Create and track todos.' },
      'skill-b': { id: 'skill-b', name: 'Meeting Management', description: 'Schedule meetings.' },
    });
    render(
      <IncludedSkillsSection
        item={packageItem([
          { id: 'skill-a', name: 'Packaged A', sortOrder: 1 },
          { id: 'skill-b', name: 'Packaged B', sortOrder: 2 },
        ])}
        locale="en-US"
        t={sectionCopy}
      />,
    );

    expect(screen.getByText('Included skills (2)')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Create and track todos.')).toBeTruthy());
    expect(screen.getByText('Todo Management')).toBeTruthy();
    expect(screen.getByText('Meeting Management')).toBeTruthy();
    expect(screen.queryByText('Packaged A')).toBeNull();
  });

  it('falls back to the packaged name when details cannot be loaded', async () => {
    stubFetchResponses({});
    render(
      <IncludedSkillsSection
        item={packageItem([{ id: 'skill-a', name: 'Packaged A', sortOrder: 1 }])}
        locale="en-US"
        t={sectionCopy}
      />,
    );

    expect(screen.getByText('Included skills (1)')).toBeTruthy();
    await waitFor(() => expect(screen.queryByText('Packaged A')).toBeTruthy());
  });

  it('falls back to the skill id when neither packaged name nor detail name exists', async () => {
    stubFetchResponses({ 'skill-a': { id: 'skill-a', name: '', description: '' } });
    render(
      <IncludedSkillsSection
        item={packageItem([{ id: 'skill-a', sortOrder: 1 }])}
        locale="en-US"
        t={sectionCopy}
      />,
    );

    await waitFor(() => expect(screen.getByText('skill-a')).toBeTruthy());
  });
});
