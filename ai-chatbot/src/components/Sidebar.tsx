'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useChatContext } from '@/context/ChatContext';
import { getCharacterById } from '@/lib/characters';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const {
    conversations,
    deleteConversation,
    isSidebarOpen,
    toggleSidebar,
  } = useChatContext();
  const router = useRouter();
  const pathname = usePathname();

  const handleConversationClick = (id: string) => {
    router.push(`/chat/${id}`);
    if (isSidebarOpen) toggleSidebar();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteConversation(id);
    if (pathname === `/chat/${id}`) {
      router.push('/');
    }
  };

  const handleNewChat = () => {
    router.push('/');
    if (isSidebarOpen) toggleSidebar();
  };

  return (
    <>
      {isSidebarOpen && (
        <div className={styles.backdrop} onClick={toggleSidebar} />
      )}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>会話履歴</h2>
          <button className={styles.newChatBtn} onClick={handleNewChat}>
            + 新しい会話
          </button>
        </div>
        <div className={styles.conversationList}>
          {conversations.length === 0 ? (
            <p className={styles.empty}>会話履歴はありません</p>
          ) : (
            conversations.map((conv) => {
              const character = getCharacterById(conv.characterId);
              const isActive = pathname === `/chat/${conv._id}`;
              return (
                <div
                  key={conv._id}
                  className={`${styles.conversationItem} ${isActive ? styles.active : ''}`}
                  onClick={() => handleConversationClick(conv._id)}
                >
                  <div className={styles.convInfo}>
                    <span className={styles.convTitle}>{conv.title}</span>
                    {character && (
                      <span
                        className={styles.convCharacter}
                        style={{ color: character.color }}
                      >
                        {character.name}
                      </span>
                    )}
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(e, conv._id)}
                    aria-label="会話を削除"
                  >
                    &times;
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}
