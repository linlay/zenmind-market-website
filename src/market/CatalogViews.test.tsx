import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConnectorComponentsSection, IncludedSkillsSection, stripMarkdownFrontMatter } from './CatalogViews';

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

describe('ConnectorComponentsSection', () => {
  it('shows bundled skills, MCP transport, and CLI platforms with descriptions', () => {
    const t = {
      connectorComponentsTitle: 'Connector components',
      connectorComponentsDescription: 'Installed capabilities.',
      connectorSkillsTitle: 'Skills',
      connectorSkillDescription: (name) => `${name} workflow`,
      connectorSkillFallbackName: 'Built-in skill',
      connectorSkillFallbackDescription: 'Built-in workflow',
      connectorMCPFallbackName: 'MCP service',
      connectorMCPDescription: (transport) => `MCP via ${transport}`,
      connectorMCPFallbackDescription: 'MCP tools',
      connectorCLIName: 'Command-line tool',
      connectorCLIDescription: (platforms) => `CLI for ${platforms}`,
      connectorCLIFallbackDescription: 'CLI tools',
      connectorToolCount: (count) => `${count} transport`,
      connectorPlatformCount: (count) => `${count} platforms`,
      connectorComponentCount: (count) => `${count} items`,
      connectorExpandComponents: (count) => `Show ${count} more`,
      connectorCollapseComponents: 'Show less',
    };
    render(<ConnectorComponentsSection item={{
      connectorCapabilities: ['skill', 'mcp', 'cli'],
      connectorSkillNames: ['document-reader'],
      connectorMCPTransports: ['streamableHttp'],
      connectorComponents: [
        { id: 'skill:document-reader', type: 'skill', name: 'document-reader', description: 'Reads and summarizes documents.' },
        { id: 'mcp:workspace', type: 'mcp', name: 'workspace', description: 'Searches the company workspace.' },
        { id: 'cli:default', type: 'cli', name: 'Workspace CLI', description: 'Runs local workspace commands.' },
      ],
      connectorConfig: {
        mcp: { serverName: 'workspace' },
        cli: { versionCommand: { darwin: 'tool --version', linux: 'tool --version' } },
      },
    }} t={t} />);

    expect(screen.getByText('document-reader')).toBeTruthy();
    expect(screen.getByText('Reads and summarizes documents.')).toBeTruthy();
    expect(screen.getByText('Searches the company workspace.')).toBeTruthy();
    expect(screen.getByText('Workspace CLI')).toBeTruthy();
    expect(screen.getByText('Runs local workspace commands.')).toBeTruthy();
    expect(screen.getByText('2 platforms')).toBeTruthy();
  });

  it('shows three components per group before expanding', () => {
    const t = {
      connectorComponentsTitle: 'Connector components', connectorComponentsDescription: 'Installed capabilities.',
      connectorSkillsTitle: 'Skills', connectorSkillDescription: (name) => `${name} workflow`,
      connectorSkillFallbackName: 'Built-in skill', connectorSkillFallbackDescription: 'Built-in workflow',
      connectorMCPFallbackName: 'MCP service', connectorMCPDescription: (value) => value,
      connectorMCPFallbackDescription: 'MCP tools', connectorCLIName: 'Command-line tool',
      connectorCLIDescription: (value) => value, connectorCLIFallbackDescription: 'CLI tools',
      connectorToolCount: (count) => String(count), connectorPlatformCount: (count) => String(count),
      connectorComponentCount: (count) => `${count} items`, connectorExpandComponents: (count) => `Show ${count} more`,
      connectorCollapseComponents: 'Show less',
    };
    render(<ConnectorComponentsSection item={{
      connectorCapabilities: ['skill'],
      connectorSkillNames: ['skill-1', 'skill-2', 'skill-3', 'skill-4'],
    }} t={t} />);

    expect(screen.queryByText('skill-4')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show 1 more' }));
    expect(screen.getByText('skill-4')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Show less' }));
    expect(screen.queryByText('skill-4')).toBeNull();
  });
});
