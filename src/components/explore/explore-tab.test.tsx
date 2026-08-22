// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExploreTab } from './explore-tab';
import type { SearchResult } from '@/api';

const defaultProps = {
  articles: [],
  featuredArticle: null,
  isSearching: false,
  isSearchFetching: false,
  trimmedQuery: '',
  category: 'All',
  setCategory: vi.fn(),
  categories: [],
  searchResults: [] as SearchResult[],
  habitTemplates: [],
  getIsSaved: vi.fn(() => false),
  onToggleSave: vi.fn(),
  onClearSearch: vi.fn(),
  onClearCategory: vi.fn(),
  onViewAllTemplates: vi.fn(),
  isSavePending: false,
};

describe('ExploreTab', () => {
  it('renders every server search result without requiring a loaded article', () => {
    render(
      <ExploreTab
        {...defaultProps}
        isSearching
        trimmedQuery="focus"
        searchResults={[
          { id: 'article-99', type: 'article', title: 'Focused Work', description: 'An article', score: 1 },
          { id: 'habit-1', type: 'habit', title: 'Morning focus', description: 'A habit', score: 0.8 },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: /Focused Work/ })).toHaveAttribute('href', '/article/article-99');
    expect(screen.getByRole('link', { name: /Morning focus/ })).toHaveAttribute('href', '/plan');
    expect(screen.getByText('2 results for “focus”')).toBeInTheDocument();
  });

  it('offers a clear action when a category has no articles', async () => {
    const user = userEvent.setup();
    const onClearCategory = vi.fn();

    render(<ExploreTab {...defaultProps} category="Calm" onClearCategory={onClearCategory} />);
    await user.click(screen.getByRole('button', { name: 'View all articles' }));

    expect(onClearCategory).toHaveBeenCalledOnce();
  });

  it('describes template previews as individual habits', () => {
    render(
      <ExploreTab
        {...defaultProps}
        habitTemplates={[{ name: 'Morning Walk', description: 'Walk outside', category: 'calm' }]}
      />,
    );

    expect(screen.getByText('Habit · calm')).toBeInTheDocument();
    expect(screen.queryByText(/3 habits/)).not.toBeInTheDocument();
  });
});
