import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '@/app/page';

vi.mock('@/context/TodoContext', () => ({
  useTodoContext: () => ({
    todos: [],
    isLoaded: true,
    addTodo: vi.fn(),
    deleteTodo: vi.fn(),
    toggleTodo: vi.fn(),
    editTodo: vi.fn(),
    updateTodoDates: vi.fn(),
  }),
}));

describe('Home (page.tsx)', () => {
  it('TodoAppコンポーネントがレンダリングされる', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: 'TODO' })).toBeInTheDocument();
  });

  it('入力フォームが表示される', () => {
    render(<Home />);
    expect(screen.getByPlaceholderText('新しいタスクを入力...')).toBeInTheDocument();
    expect(screen.getByText('追加')).toBeInTheDocument();
  });

  it('フィルターボタンが表示される', () => {
    render(<Home />);
    expect(screen.getByText('すべて')).toBeInTheDocument();
    expect(screen.getByText('未完了')).toBeInTheDocument();
    expect(screen.getByText('完了済み')).toBeInTheDocument();
  });
});
