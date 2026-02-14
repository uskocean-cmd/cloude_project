import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CharacterSelect from '@/components/CharacterSelect';

const mockPush = vi.fn();
const mockSelectCharacter = vi.fn();
const mockCreateConversation = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/context/ChatContext', () => ({
  useChatContext: () => ({
    characters: [
      {
        id: 'arthur',
        name: 'アーサー・コグウェル',
        description: '天才発明家。好奇心旺盛で、歯車と蒸気機関の仕組みを何でも語りたがる老紳士。',
        avatar: '/avatars/arthur.svg',
        systemPrompt: 'テスト',
        color: '#c8a86e',
      },
      {
        id: 'rivet',
        name: 'リヴェット',
        description: '機械工の少女。腕利きの修理屋で、ぶっきらぼうだが面倒見が良い。',
        avatar: '/avatars/rivet.svg',
        systemPrompt: 'テスト',
        color: '#d4a84b',
      },
      {
        id: 'nebula',
        name: 'ネビュラ卿',
        description: '空中都市の探検家。詩的な表現を好み、冒険譚を語るのが得意な貴族。',
        avatar: '/avatars/nebula.svg',
        systemPrompt: 'テスト',
        color: '#6b9dba',
      },
    ],
    selectCharacter: mockSelectCharacter,
    createConversation: mockCreateConversation,
    userId: 'test-user-id',
  }),
}));

describe('CharacterSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateConversation.mockResolvedValue('new-conv-id');
  });

  it('タイトルを表示する', () => {
    render(<CharacterSelect />);
    expect(screen.getByText('Steampunk AI Chat')).toBeInTheDocument();
  });

  it('サブタイトルを表示する', () => {
    render(<CharacterSelect />);
    expect(screen.getByText('キャラクターを選んで会話を始めましょう')).toBeInTheDocument();
  });

  it('3体のキャラクターカードを表示する', () => {
    render(<CharacterSelect />);
    expect(screen.getByText('アーサー・コグウェル')).toBeInTheDocument();
    expect(screen.getByText('リヴェット')).toBeInTheDocument();
    expect(screen.getByText('ネビュラ卿')).toBeInTheDocument();
  });

  it('各キャラクターの説明文を表示する', () => {
    render(<CharacterSelect />);
    expect(
      screen.getByText(/天才発明家。好奇心旺盛で/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/機械工の少女。腕利きの修理屋で/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/空中都市の探検家。詩的な表現を好み/)
    ).toBeInTheDocument();
  });

  it('各キャラクターのアバター画像を表示する', () => {
    render(<CharacterSelect />);
    expect(screen.getByAltText('アーサー・コグウェル')).toBeInTheDocument();
    expect(screen.getByAltText('リヴェット')).toBeInTheDocument();
    expect(screen.getByAltText('ネビュラ卿')).toBeInTheDocument();
  });

  it('キャラクターをクリックすると会話が作成されチャット画面に遷移する', async () => {
    const user = userEvent.setup();
    render(<CharacterSelect />);

    const arthurCard = screen.getByText('アーサー・コグウェル').closest('button')!;
    await user.click(arthurCard);

    expect(mockSelectCharacter).toHaveBeenCalledWith('arthur');
    expect(mockCreateConversation).toHaveBeenCalledWith('arthur', '新しい会話');
    expect(mockPush).toHaveBeenCalledWith('/chat/new-conv-id');
  });
});
