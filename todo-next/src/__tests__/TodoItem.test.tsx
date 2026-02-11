import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TodoItem from '@/components/TodoItem';
import type { Todo } from '@/types/todo';

const mockToggleTodo = vi.fn();
const mockDeleteTodo = vi.fn();
const mockEditTodo = vi.fn();
const mockUpdateTodoDates = vi.fn();

vi.mock('@/context/TodoContext', () => ({
  useTodoContext: () => ({
    todos: [],
    isLoaded: true,
    addTodo: vi.fn(),
    deleteTodo: mockDeleteTodo,
    toggleTodo: mockToggleTodo,
    editTodo: mockEditTodo,
    updateTodoDates: mockUpdateTodoDates,
  }),
}));

const baseTodo: Todo = {
  id: 1,
  text: 'テストタスク',
  completed: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

function renderTodoItem(todo: Todo = baseTodo) {
  return render(<TodoItem todo={todo} />);
}

describe('TodoItem', () => {
  it('タスクのテキストが表示される', () => {
    renderTodoItem();
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
  });

  it('チェックボックスが未完了状態で表示される', () => {
    renderTodoItem();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('チェックボックスが完了状態で表示される', () => {
    renderTodoItem({ ...baseTodo, completed: true });
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('チェックボックスをクリックするとtoggleTodoが呼ばれる', async () => {
    renderTodoItem();
    await userEvent.click(screen.getByRole('checkbox'));
    expect(mockToggleTodo).toHaveBeenCalledWith(1);
  });

  it('削除ボタンをクリックするとdeleteTodoが呼ばれる', async () => {
    renderTodoItem();
    await userEvent.click(screen.getByText('削除'));
    expect(mockDeleteTodo).toHaveBeenCalledWith(1);
  });

  it('日付が設定されていない場合、日付行が表示されない', () => {
    renderTodoItem();
    expect(screen.queryByTitle('クリックして編集')).not.toBeInTheDocument();
  });

  it('開始日と終了日が設定されている場合、日付が表示される', () => {
    renderTodoItem({ ...baseTodo, startDate: '2025-01-01', endDate: '2025-01-31' });
    expect(screen.getByText(/2025\/01\/01/)).toBeInTheDocument();
    expect(screen.getByText(/2025\/01\/31/)).toBeInTheDocument();
  });

  it('開始日のみ設定されている場合、開始日だけ表示される', () => {
    renderTodoItem({ ...baseTodo, startDate: '2025-03-15' });
    expect(screen.getByText('2025/03/15')).toBeInTheDocument();
  });

  it('終了日のみ設定されている場合、終了日だけ表示される', () => {
    renderTodoItem({ ...baseTodo, endDate: '2099-06-30' });
    expect(screen.getByText('2099/06/30')).toBeInTheDocument();
  });

  it('期限切れの場合「(期限切れ)」が表示される', () => {
    renderTodoItem({ ...baseTodo, endDate: '2020-01-01' });
    expect(screen.getByText(/(期限切れ)/)).toBeInTheDocument();
  });

  it('完了済みタスクは期限切れ表示にならない', () => {
    renderTodoItem({ ...baseTodo, completed: true, endDate: '2020-01-01' });
    expect(screen.queryByText(/(期限切れ)/)).not.toBeInTheDocument();
  });

  it('日付表示をクリックすると編集モードになる', async () => {
    renderTodoItem({ ...baseTodo, startDate: '2025-01-01', endDate: '2025-01-31' });
    await userEvent.click(screen.getByTitle('クリックして編集'));
    const dateInputs = screen.getAllByDisplayValue(/2025/);
    expect(dateInputs.length).toBe(2);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('日付編集モードでOKを押すと表示モードに戻る', async () => {
    renderTodoItem({ ...baseTodo, startDate: '2025-01-01', endDate: '2025-01-31' });
    await userEvent.click(screen.getByTitle('クリックして編集'));
    await userEvent.click(screen.getByText('OK'));
    expect(screen.queryByText('OK')).not.toBeInTheDocument();
    expect(screen.getByTitle('クリックして編集')).toBeInTheDocument();
  });

  it('日付編集で開始日を変更するとupdateTodoDatesが呼ばれる', async () => {
    renderTodoItem({ ...baseTodo, startDate: '2025-01-01', endDate: '2025-01-31' });
    await userEvent.click(screen.getByTitle('クリックして編集'));
    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2025-02-01' } });
    expect(mockUpdateTodoDates).toHaveBeenCalledWith(1, '2025-02-01', '2025-01-31');
  });

  it('ダブルクリックでテキスト編集モードになる', async () => {
    renderTodoItem();
    const textSpan = screen.getByText('テストタスク');
    await userEvent.dblClick(textSpan);
    expect(textSpan).toHaveAttribute('contenteditable', 'true');
  });
});
