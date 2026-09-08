import type { ComponentType, ReactNode } from 'react';
import { Heart, PackageOpen, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

type Category = {
  id: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  colorClass: string;
};

type MarketPageProps = {
  activeCategory: string;
  activeSkillCategory: string;
  categories: Category[];
  categoryCounts: Record<string, number>;
  currentCategoryName: string;
  emptyCopy: { title: string; body: string };
  filtered: unknown[];
  isAuthenticated: boolean;
  locale: string;
  skillCategories: string[];
  skillCounts: Record<string, number>;
  favoritesOnly: boolean;
  sortMode: string;
  status: string;
  error: string;
  isSidebarCollapsed: boolean;
  t: any;
  onCategoryChange: (category: string) => void;
  onSkillCategoryChange: (category: string) => void;
  onFavoritesOnlyChange: (enabled: boolean) => void;
  onSortModeChange: (mode: string) => void;
  onSidebarCollapsedChange: (collapsed: boolean) => void;
  renderCatalog: () => ReactNode;
};

export function MarketPage({
  activeCategory,
  activeSkillCategory,
  categories,
  categoryCounts,
  currentCategoryName,
  emptyCopy,
  filtered,
  isAuthenticated,
  skillCategories,
  skillCounts,
  favoritesOnly,
  sortMode,
  status,
  error,
  isSidebarCollapsed,
  t,
  onCategoryChange,
  onSkillCategoryChange,
  onFavoritesOnlyChange,
  onSortModeChange,
  onSidebarCollapsedChange,
  renderCatalog,
}: MarketPageProps) {
  return (
    <div className={isSidebarCollapsed ? 'workspace is-sidebar-collapsed' : 'workspace'}>
      <aside className={isSidebarCollapsed ? 'sidebar is-collapsed' : 'sidebar'}>
        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => onSidebarCollapsedChange(!isSidebarCollapsed)}
          data-tooltip={isSidebarCollapsed ? undefined : t.collapseSidebar}
          aria-label={isSidebarCollapsed ? t.expandSidebar : t.collapseSidebar}
        >
          {isSidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
        <div className="sidebar-main">
          <section>
            <h3>{t.categoriesTitle}</h3>
            <nav className="category-nav" aria-label={t.categoriesTitle}>
              {categories.map((category) => {
                const Icon = category.icon;
                const active = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    className={active ? 'category-button is-active' : 'category-button'}
                    type="button"
                    onClick={() => onCategoryChange(category.id)}
                    title={isSidebarCollapsed ? (category.id === 'all' ? t.all : t.categories[category.id]) : undefined}
                  >
                    <span className="category-label">
                      <Icon className={category.colorClass} size={15} />
                      <span>{category.id === 'all' ? t.all : t.categories[category.id]}</span>
                    </span>
                    <span className="category-count">{categoryCounts[category.id] || 0}</span>
                  </button>
                );
              })}
            </nav>
          </section>
        </div>
        <p className="sidebar-footer">{t.footer}</p>
      </aside>

      <section className="content-pane">
        <div className="content-header">
          <div className="content-title">
            <h1>{currentCategoryName}</h1>
            <span>{t.count(filtered.length)}</span>
          </div>
          <div className="catalog-controls">
            <label className="sort-control">
              <span>{t.sortLabel}</span>
              <select
                aria-label={t.sortLabel}
                value={sortMode}
                onChange={(event) => onSortModeChange(event.target.value)}
              >
                <option value="popular">{t.sortPopular}</option>
                <option value="latest">{t.sortLatest}</option>
                <option value="rating">{t.sortRating}</option>
              </select>
            </label>
            {isAuthenticated ? (
              <button
                className={favoritesOnly ? 'favorites-only-control is-active' : 'favorites-only-control'}
                type="button"
                aria-label={t.favoritesOnly}
                aria-pressed={favoritesOnly}
                title={t.favoritesOnly}
                onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
              >
                <Heart size={17} fill={favoritesOnly ? 'currentColor' : 'none'} aria-hidden="true" />
                <span>{t.favoritesOnly}</span>
              </button>
            ) : null}
          </div>
        </div>

        {activeCategory === 'skill' ? (
          <section className="skill-filter-panel" aria-label={t.skillCategoryTitle}>
            <div className="skill-chip-row">
              {skillCategories.map((category) => (
                <button
                  key={category}
                  className={activeSkillCategory === category ? 'is-active' : ''}
                  type="button"
                  onClick={() => onSkillCategoryChange(category)}
                >
                  <span>{t.skillCategories[category]}</span>
                  <small>{skillCounts[category] || 0}</small>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {status === 'loading' ? <StateNotice title={t.loadingTitle} body={t.loadingBody} /> : null}
        {status === 'error' ? (
          <StateNotice
            tone="error"
            title={t.loadingErrorTitle}
            body={`${t.loadingErrorBody} ${error ? `(${error})` : ''}`}
          />
        ) : null}

        <div className="catalog-scroll">
          {filtered.length ? renderCatalog() : (
            <div className="empty-state">
              <PackageOpen size={34} />
              <strong>{emptyCopy.title}</strong>
              <span>{emptyCopy.body}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StateNotice({ title, body, tone = 'neutral' }: { title: string; body: string; tone?: string }) {
  return (
    <div className={`state-notice is-${tone}`}>
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}
