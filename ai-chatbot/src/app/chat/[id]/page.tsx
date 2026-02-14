'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useChatContext } from '@/context/ChatContext';
import ChatArea from '@/components/ChatArea';
import Sidebar from '@/components/Sidebar';
import styles from './page.module.css';

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  const { toggleSidebar, selectCharacter } = useChatContext();
  const [characterId, setCharacterId] = useState<string | null>(null);

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const res = await fetch(`/api/conversations/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCharacterId(data.characterId);
          selectCharacter(data.characterId);
        }
      } catch (error) {
        console.error('Failed to load conversation:', error);
      }
    };
    loadConversation();
  }, [id, selectCharacter]);

  if (!characterId) {
    return (
      <div className={styles.loading}>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className={styles.chatLayout}>
      <Sidebar />
      <div className={styles.mainArea}>
        <button className={styles.menuButton} onClick={toggleSidebar}>
          &#9776;
        </button>
        <ChatArea conversationId={id} characterId={characterId} />
      </div>
    </div>
  );
}
