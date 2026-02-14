import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from '@/components/ChatInput';

describe('ChatInput', () => {
  let mockOnSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSend = vi.fn();
  });

  it('テキストエリアと送信ボタンをレンダリングする', () => {
    render(<ChatInput onSend={mockOnSend} isDisabled={false} />);
    expect(screen.getByPlaceholderText('メッセージを入力...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument();
  });

  it('フォーム送信時にonSendが呼ばれる', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} isDisabled={false} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力...');
    await user.type(textarea, 'テストメッセージ');

    const button = screen.getByRole('button', { name: '送信' });
    await user.click(button);

    expect(mockOnSend).toHaveBeenCalledWith('テストメッセージ');
  });

  it('送信後に入力欄がクリアされる', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} isDisabled={false} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力...');
    await user.type(textarea, 'テスト');

    const button = screen.getByRole('button', { name: '送信' });
    await user.click(button);

    expect(textarea).toHaveValue('');
  });

  it('空のテキストではonSendが呼ばれない', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} isDisabled={false} />);

    const button = screen.getByRole('button', { name: '送信' });
    await user.click(button);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('空白のみのテキストではonSendが呼ばれない', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} isDisabled={false} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力...');
    await user.type(textarea, '   ');

    const button = screen.getByRole('button', { name: '送信' });
    await user.click(button);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('isDisabledがtrueの場合、テキストエリアとボタンが無効になる', () => {
    render(<ChatInput onSend={mockOnSend} isDisabled={true} />);

    expect(screen.getByPlaceholderText('メッセージを入力...')).toBeDisabled();
    expect(screen.getByRole('button', { name: '送信' })).toBeDisabled();
  });

  it('Enterキーで送信される（Shiftなし）', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} isDisabled={false} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力...');
    await user.type(textarea, 'Enterテスト');
    await user.keyboard('{Enter}');

    expect(mockOnSend).toHaveBeenCalledWith('Enterテスト');
  });

  it('Shift+Enterでは送信されない', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={mockOnSend} isDisabled={false} />);

    const textarea = screen.getByPlaceholderText('メッセージを入力...');
    await user.type(textarea, 'テスト');
    await user.keyboard('{Shift>}{Enter}{/Shift}');

    expect(mockOnSend).not.toHaveBeenCalled();
  });
});
