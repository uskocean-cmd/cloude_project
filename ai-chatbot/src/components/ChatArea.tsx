'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { useChatContext } from '@/context/ChatContext';
import { getCharacterById } from '@/lib/characters';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import styles from './ChatArea.module.css';
import type { Message } from '@/types/chat';

interface ChatAreaProps {
  conversationId: string;
  characterId: string;
}

interface HistoryMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatArea({ conversationId, characterId }: ChatAreaProps) {
  const { userId, loadConversations } = useChatContext();
  const character = getCharacterById(characterId) ?? null;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [historyMessages, setHistoryMessages] = useState<HistoryMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setHistoryMessages(
              data.messages.map((m: Message, i: number) => ({
                id: `history-${i}`,
                role: m.role,
                content: m.content,
              }))
            );
          }
        }
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
      setIsLoadingHistory(false);
    };
    loadHistory();
  }, [conversationId]);

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: `/api/chat?characterId=${encodeURIComponent(characterId)}&conversationId=${encodeURIComponent(conversationId)}&userId=${encodeURIComponent(userId)}`,
      }),
    [characterId, conversationId, userId]
  );

  const { messages: chatMessages, sendMessage, status } = useChat({
    transport,
    id: conversationId,
  });

  const handleSend = useCallback(
    (text: string) => {
      sendMessage({ text });
      setTimeout(() => loadConversations(), 2000);
    },
    [sendMessage, loadConversations]
  );

  const allMessages = useMemo(() => {
    const history = historyMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    }));
    const live = chatMessages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.parts
        .filter((p) => p.type === 'text')
        .map((p) => (p as { type: 'text'; text: string }).text)
        .join(''),
    }));
    return [...history, ...live];
  }, [historyMessages, chatMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const isStreaming = status === 'streaming';

  if (isLoadingHistory) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {character && (
          <>
            <div
              className={styles.headerAvatar}
              style={{ borderColor: character.color }}
            >
              <img src={character.avatar} alt={character.name} />
            </div>
            <h2 className={styles.headerName} style={{ color: character.color }}>
              {character.name}
            </h2>
          </>
        )}
      </div>
      <div className={styles.messagesArea}>
        {allMessages.length === 0 && (
          <div className={styles.emptyState}>
            <p>
              {character
                ? `${character.name}と会話を始めましょう`
                : '会話を始めましょう'}
            </p>
          </div>
        )}
        {allMessages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            character={message.role === 'assistant' ? character : undefined}
          />
        ))}
        {isStreaming && allMessages[allMessages.length - 1]?.role !== 'assistant' && (
          <div className={styles.typing}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSend} isDisabled={isStreaming} />
    </div>
  );
}
