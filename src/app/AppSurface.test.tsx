import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';

function CurrentPath() {
  return <output aria-label="current path">{useLocation().pathname}</output>;
}
import { AppSurface } from './AppSurface';

describe('application surface', () => {
  it('shows the publishing workspace at its route', () => {
    render(
      <MemoryRouter initialEntries={['/publish']}>
        <AppSurface
          publishing={<div>Publishing workspace</div>}
          admin={<div>Admin workspace</div>}
          creator={<div>Creator workspace</div>}
          market={<div>Market workspace</div>}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Publishing workspace')).toBeInTheDocument();
    expect(screen.queryByText('Admin workspace')).not.toBeInTheDocument();
  });

  it('keeps the market workspace visible at category URLs', () => {
    render(
      <MemoryRouter initialEntries={['/category/plugin']}>
        <CurrentPath />
        <AppSurface
            publishing={<div>Publishing workspace</div>}
            admin={<div>Admin workspace</div>}
            creator={<div>Creator workspace</div>}
            market={<div>Market workspace</div>}
          />
      </MemoryRouter>,
    );

    expect(screen.getByText('Market workspace')).toBeInTheDocument();
    expect(screen.getByLabelText('current path')).toHaveTextContent('/category/plugin');
  });

  it('keeps a skill filter URL while showing the market workspace', () => {
    render(
      <MemoryRouter initialEntries={['/skills/coding']}>
        <CurrentPath />
        <AppSurface
          publishing={<div>Publishing workspace</div>}
          admin={<div>Admin workspace</div>}
          creator={<div>Creator workspace</div>}
          market={<div>Market workspace</div>}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Market workspace')).toBeInTheDocument();
    expect(screen.getByLabelText('current path')).toHaveTextContent('/skills/coding');
  });

  it('keeps the component identity in a version publishing URL', () => {
    render(
      <MemoryRouter initialEntries={['/publish/plugin/demo-plugin']}>
        <CurrentPath />
        <AppSurface
          publishing={<div>Publishing workspace</div>}
          admin={<div>Admin workspace</div>}
          creator={<div>Creator workspace</div>}
          market={<div>Market workspace</div>}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Publishing workspace')).toBeInTheDocument();
    expect(screen.getByLabelText('current path')).toHaveTextContent('/publish/plugin/demo-plugin');
  });

  it('redirects an unknown interface URL to the market home', async () => {
    render(
      <MemoryRouter initialEntries={['/unknown-interface']}>
        <CurrentPath />
        <AppSurface
          publishing={<div>Publishing workspace</div>}
          admin={<div>Admin workspace</div>}
          creator={<div>Creator workspace</div>}
          market={<div>Market workspace</div>}
        />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Market workspace')).toBeInTheDocument();
    expect(screen.getByLabelText('current path')).toHaveTextContent('/');
  });
});
