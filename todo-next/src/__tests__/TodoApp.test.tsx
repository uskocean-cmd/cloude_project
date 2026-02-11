import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TodoApp from '@/components/TodoApp';

const mockAddTodo = vi.fn();

let mockTodos = [
  { id: 1, text: 'タスク1', completed: false },
  { id: 2, text: 'タスク2', completed: true },
  { id: 3, text: 'タスク3', completed: false, startDate: '2025-01-01', endDate: '2025-12-31' },
];

vi.mock('@/context/TodoContext', () => ({
  useTodoContext: () => ({
    todos: mockTodos,
    isLoaded: true,
    addTodo: mockAddTodo,
    deleteTodo: vi.fn(),
    toggleTodo: vi.fn(),
    editTodo: vi.fn(),
    updateTodoDates: vi.fn(),
  }),
}));

beforeEach(() => {
  mockTodos = [
    { id: 1, text: 'タスク1', completed: false },
    { id: 2, text: 'タスク2', completed: true },
    { id: 3, text: 'タスク3', completed: false, startDate: '2025-01-01', endDate: '2025-12-31' },
  ];
  vi.clearAllMocks();
});

describe('TodoApp', () => {
  it('タイトル「TODO」が表示される', () => {
    render(<TodoApp />);
    expect(screen.getByRole('heading', { name: 'TODO' })).toBeInTheDocument();
  });

  it('入力フィールドとボタンが表示される', () => {
    render(<TodoApp />);
    expect(screen.getByPlaceholderText('新しいタスクを入力...')).toBeInTheDocument();
    expect(screen.getByText('追加')).toBeInTheDocument();
  });

  it('日付入力フィールドが表示される', () => {
    render(<TodoApp />);
    const dateInputs = document.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBe(2);
  });

  it('フィルターボタンが3つ表示される', () => {
    render(<TodoApp />);
    expect(screen.getByText('すべて')).toBeInTheDocument();
    expect(screen.getByText('未完了')).toBeInTheDocument();
    expect(screen.getByText('完了済み')).toBeInTheDocument();
  });

  it('すべてのタスクが表示される', () => {
    render(<TodoApp />);
    expect(screen.getByText('タスク1')).toBeInTheDocument();
    expect(screen.getByText('タスク2')).toBeInTheDocument();
    expect(screen.getByText('タスク3')).toBeInTheDocument();
  });

  it('未完了タスク数が正しく表示される', () => {
    render(<TodoApp />);
    expect(screen.getByText('2 件の未完了タスク / 全 3 件')).toBeInTheDocument();
  });

  it('テキストを入力して追加ボタンを押すとaddTodoが呼ばれる', async () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText('新しいタスクを入力...');
    await userEvent.type(input, '新しいタスク');
    await userEvent.click(screen.getByText('追加'));
    expect(mockAddTodo).toHaveBeenCalledWith('新しいタスク', undefined, undefined);
  });

  it('日付付きでタスクを追加するとaddTodoに日付が渡される', async () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText('新しいタスクを入力...');
    const dateInputs = document.querySelectorAll('input[type="date"]');

    await userEvent.type(input, '期限付きタスク');
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(dateInputs[0], { target: { value: '2025-04-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-04-30' } });
    await userEvent.click(screen.getByText('追加'));
    expect(mockAddTodo).toHaveBeenCalledWith('期限付きタスク', '2025-04-01', '2025-04-30');
  });

  it('空のテキストではタスクが追加されない', async () => {
    render(<TodoApp />);
    await userEvent.click(screen.getByText('追加'));
    expect(mockAddTodo).not.toHaveBeenCalled();
  });

  it('未完了フィルターで完了タスクが非表示になる', async () => {
    render(<TodoApp />);
    await userEvent.click(screen.getByText('未完了'));
    expect(screen.getByText('タスク1')).toBeInTheDocument();
    expect(screen.queryByText('タスク2')).not.toBeInTheDocument();
    expect(screen.getByText('タスク3')).toBeInTheDocument();
  });

  it('完了済みフィルターで未完了タスクが非表示になる', async () => {
    render(<TodoApp />);
    await userEvent.click(screen.getByText('完了済み'));
    expect(screen.queryByText('タスク1')).not.toBeInTheDocument();
    expect(screen.getByText('タスク2')).toBeInTheDocument();
    expect(screen.queryByText('タスク3')).not.toBeInTheDocument();
  });

  it('すべてフィルターで全タスクが表示される', async () => {
    render(<TodoApp />);
    await userEvent.click(screen.getByText('未完了'));
    await userEvent.click(screen.getByText('すべて'));
    expect(screen.getByText('タスク1')).toBeInTheDocument();
    expect(screen.getByText('タスク2')).toBeInTheDocument();
    expect(screen.getByText('タスク3')).toBeInTheDocument();
  });

  it('タスクがない場合はカウントが表示されない', () => {
    mockTodos = [];
    render(<TodoApp />);
    expect(screen.queryByText(/件の未完了タスク/)).not.toBeInTheDocument();
  });
});
