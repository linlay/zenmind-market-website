import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { UserManualPage } from './UserManualPage';

describe('user manual publishing pages', () => {
  it('shows the skills guide without rendering the other publishing page content', () => {
    render(
      <MemoryRouter initialEntries={['/guide/publishing/skills']}>
        <UserManualPage onClose={() => undefined} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '单项技能与技能包' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '三、metadata 的数据格式怎么写' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '2.2 小节导航' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '03 metadata' })).toHaveAttribute('href', '/guide/publishing/skills#manual-skill-metadata');
    expect(screen.getByText(/最小可通过市场版本校验的 SKILL\.md/)).toBeInTheDocument();
    expect(screen.getByText(/当前市场提交时真正读取并强制校验的字段只有/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '通用发布流程' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '各类组件发布须知' })).not.toBeInTheDocument();
  });

  it('shows the general publishing guide as its own page', () => {
    render(
      <MemoryRouter initialEntries={['/guide/publishing/general']}>
        <UserManualPage onClose={() => undefined} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '通用发布流程' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '单项技能与技能包' })).not.toBeInTheDocument();
  });
});
