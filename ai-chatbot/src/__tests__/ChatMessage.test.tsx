import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatMessage from '@/components/ChatMessage';
import type { Character } from '@/types/chat';

const mockCharacter: Character = {
  id: 'arthur',
  name: 'アーサー・コグウェル',
  description: '天才発明家',
  avatar: '/avatars/arthur.svg',
  systemPrompt: 'テスト用プロンプト',
  color: '#c8a86e',
};

describe('ChatMessage', () => {
  it('ユーザーメッセージのテキストを表示する', () => {
    render(<ChatMessage role="user" content="こんにちは" />);
    expect(screen.getByText('こんにちは')).toBeInTheDocument();
  });

  it('アシスタントメッセージのテキストを表示する', () => {
    render(
      <ChatMessage role="assistant" content="お元気ですか？" character={mockCharacter} />
    );
    expect(screen.getByText('お元気ですか？')).toBeInTheDocument();
  });

  it('アシスタントメッセージにキャラクター名を表示する', () => {
    render(
      <ChatMessage role="assistant" content="テスト" character={mockCharacter} />
    );
    expect(screen.getByText('アーサー・コグウェル')).toBeInTheDocument();
  });

  it('ユーザーメッセージにキャラクター名を表示しない', () => {
    render(<ChatMessage role="user" content="テスト" />);
    expect(screen.queryByText('アーサー・コグウェル')).not.toBeInTheDocument();
  });

  it('アシスタントメッセージにアバター画像を表示する', () => {
    render(
      <ChatMessage role="assistant" content="テスト" character={mockCharacter} />
    );
    const img = screen.getByAltText('アーサー・コグウェル');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/avatars/arthur.svg');
  });

  it('ユーザーメッセージにアバター画像を表示しない', () => {
    render(<ChatMessage role="user" content="テスト" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('アシスタントメッセージでMarkdownの太字をレンダリングする', () => {
    render(
      <ChatMessage role="assistant" content="**太字テスト**" character={mockCharacter} />
    );
    const strong = screen.getByText('太字テスト');
    expect(strong.tagName).toBe('STRONG');
  });

  it('ユーザーメッセージとアシスタントメッセージで異なるスタイルが適用される', () => {
    const { container: userContainer } = render(
      <ChatMessage role="user" content="ユーザー" />
    );
    const { container: assistantContainer } = render(
      <ChatMessage role="assistant" content="アシスタント" character={mockCharacter} />
    );

    const userMessage = userContainer.querySelector('.user');
    const assistantMessage = assistantContainer.querySelector('.assistant');
    expect(userMessage).toBeInTheDocument();
    expect(assistantMessage).toBeInTheDocument();
  });
});
