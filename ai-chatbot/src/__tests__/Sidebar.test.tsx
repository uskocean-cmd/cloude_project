import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '@/components/Sidebar';

const mockPush = vi.fn();
const mockDeleteConversation = vi.fn();
const mockToggleSidebar = vi.fn();
let mockConversations = [
  {
    _id: 'conv-1',
    userId: 'user-1',
    characterId: 'arthur',
    title: 'テスト会話1',
    messages: [],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    _id: 'conv-2',
    userId: 'user-1',
    characterId: 'rivet',
    title: 'テスト会話2',
    messages: [],
    createdAt: '2025-01-02',
    updatedAt: '2025-01-02',
  },
];

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/chat/conv-1',
}));

vi.mock('@/context/ChatContext', () => ({
  useChatContext: () => ({
    conversations: mockConversations,
    deleteConversation: mockDeleteConversation,
    isSidebarOpen: false,
    toggleSidebar: mockToggleSidebar,
  }),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteConversation.mockResolvedValue(undefined);
  });

  it('会話履歴のタイトルを表示する', () => {
    render(<Sidebar />);
    expect(screen.getByText('会話履歴')).toBeInTheDocument();
  });

  it('新しい会話ボタンを表示する', () => {
    render(<Sidebar />);
    expect(screen.getByText('+ 新しい会話')).toBeInTheDocument();
  });

  it('会話一覧のタイトルを表示する', () => {
    render(<Sidebar />);
    expect(screen.getByText('テスト会話1')).toBeInTheDocument();
    expect(screen.getByText('テスト会話2')).toBeInTheDocument();
  });

  it('各会話にキャラクター名を表示する', () => {
    render(<Sidebar />);
    expect(screen.getByText('アーサー・コグウェル')).toBeInTheDocument();
    expect(screen.getByText('リヴェット')).toBeInTheDocument();
  });

  it('削除ボタンが存在する', () => {
    render(<Sidebar />);
    const deleteButtons = screen.getAllByLabelText('会話を削除');
    expect(deleteButtons).toHaveLength(2);
  });

  it('削除ボタンをクリックするとdeleteConversationが呼ばれる', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const deleteButtons = screen.getAllByLabelText('会話を削除');
    await user.click(deleteButtons[0]);

    expect(mockDeleteConversation).toHaveBeenCalledWith('conv-1');
  });

  it('新しい会話ボタンをクリックするとトップページに遷移する', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    await user.click(screen.getByText('+ 新しい会話'));
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('会話がない場合は空メッセージを表示する', () => {
    mockConversations = [];
    render(<Sidebar />);
    expect(screen.getByText('会話履歴はありません')).toBeInTheDocument();
    mockConversations = [
      {
        _id: 'conv-1',
        userId: 'user-1',
        characterId: 'arthur',
        title: 'テスト会話1',
        messages: [],
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
      {
        _id: 'conv-2',
        userId: 'user-1',
        characterId: 'rivet',
        title: 'テスト会話2',
        messages: [],
        createdAt: '2025-01-02',
        updatedAt: '2025-01-02',
      },
    ];
  });
});
