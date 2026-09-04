import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MarketPage } from './MarketPage';

const copy = {
  categoriesTitle: 'Categories',
  all: 'All',
  categories: { skill: 'Skills' },
  footer: 'Footer',
  count: (value: number) => `${value} items`,
  sortLabel: 'Sort',
  sortPopular: 'Popular',
  sortLatest: 'Latest',
  sortRating: 'Rating',
  favoritesOnly: 'My favorites only',
  loadingTitle: 'Loading',
  loadingBody: 'Loading catalog',
  loadingErrorTitle: 'Error',
  loadingErrorBody: 'Could not load',
  skillCategoryTitle: 'Skill categories',
  skillCategories: { all: 'All skills' },
};

describe('market page', () => {
  it('lets a visitor change the catalog sort mode', () => {
    const onSortModeChange = vi.fn();

    render(
      <MarketPage
        activeCategory="all"
        activeSkillCategory="all"
        categories={[{ id: 'all', icon: () => null, colorClass: '' }]}
        categoryCounts={{ all: 2 }}
        currentCategoryName="All"
        emptyCopy={{ title: 'Empty', body: 'No entries' }}
        filtered={[]}
        isAuthenticated={false}
        locale="en-US"
        skillCategories={['all']}
        skillCounts={{ all: 0 }}
        favoritesOnly={false}
        sortMode="popular"
        status="ready"
        error=""
        t={copy}
        onCategoryChange={vi.fn()}
        onSkillCategoryChange={vi.fn()}
        onFavoritesOnlyChange={vi.fn()}
        onSortModeChange={onSortModeChange}
        renderCatalog={() => <div>Catalog</div>}
      />,
    );

    fireEvent.change(screen.getByLabelText('Sort'), { target: { value: 'latest' } });
    expect(onSortModeChange).toHaveBeenCalledWith('latest');
  });

  it('lets an authenticated user filter to personal favorites', () => {
    const onFavoritesOnlyChange = vi.fn();

    render(
      <MarketPage
        activeCategory="all"
        activeSkillCategory="all"
        categories={[{ id: 'all', icon: () => null, colorClass: '' }]}
        categoryCounts={{ all: 2 }}
        currentCategoryName="All"
        emptyCopy={{ title: 'Empty', body: 'No entries' }}
        filtered={[]}
        isAuthenticated
        locale="en-US"
        skillCategories={['all']}
        skillCounts={{ all: 0 }}
        favoritesOnly={false}
        sortMode="popular"
        status="ready"
        error=""
        t={copy}
        onCategoryChange={vi.fn()}
        onSkillCategoryChange={vi.fn()}
        onFavoritesOnlyChange={onFavoritesOnlyChange}
        onSortModeChange={vi.fn()}
        renderCatalog={() => <div>Catalog</div>}
      />,
    );

    fireEvent.click(screen.getByLabelText('My favorites only'));
    expect(onFavoritesOnlyChange).toHaveBeenCalledWith(true);
  });
});
