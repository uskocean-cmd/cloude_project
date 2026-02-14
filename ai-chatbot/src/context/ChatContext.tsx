'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Character, Conversation } from '@/types/chat';
import { getUserId } from '@/lib/userId';
import { CHARACTERS } from '@/lib/characters';

interface ChatContextValue {
  userId: string;
  characters: readonly Character[];
  selectedCharacter: Character | null;
  selectCharacter: (id: string) => void;
  conversations: Conversation[];
  loadConversations: () => Promise<void>;
  createConversation: (characterId: string, title: string) => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isLoaded: boolean;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    setIsLoaded(true);
  }, []);

  const loadConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/conversations?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId, loadConversations]);

  const selectCharacter = useCallback((id: string) => {
    const char = CHARACTERS.find((c) => c.id === id) ?? null;
    setSelectedCharacter(char);
  }, []);

  const createConversation = useCallback(
    async (characterId: string, title: string): Promise<string> => {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, characterId, title }),
      });
      const conv = await res.json();
      setConversations((prev) => [conv, ...prev]);
      return conv._id;
    },
    [userId]
  );

  const deleteConversation = useCallback(async (id: string) => {
    await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    setConversations((prev) => prev.filter((c) => c._id !== id));
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        userId,
        characters: CHARACTERS,
        selectedCharacter,
        selectCharacter,
        conversations,
        loadConversations,
        createConversation,
        deleteConversation,
        isSidebarOpen,
        toggleSidebar,
        isLoaded,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
