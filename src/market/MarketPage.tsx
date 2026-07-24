import type { ComponentType, ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';

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
  sortMode: string;
  status: string;
  error: string;
  t: any;
  onCategoryChange: (category: string) => void;
  onSkillCategoryChange: (category: string) => void;
  onSortModeChange: (mode: string) => void;
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
  skillCategories,
  skillCounts,
  sortMode,
  status,
  error,
  t,
  onCategoryChange,
  onSkillCategoryChange,
  onSortModeChange,
  renderCatalog,
}: MarketPageProps) {
  return (
    <div className="workspace">
      <aside className="sidebar">
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
