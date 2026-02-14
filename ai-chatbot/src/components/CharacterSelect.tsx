'use client';

import { useRouter } from 'next/navigation';
import { useChatContext } from '@/context/ChatContext';
import styles from './CharacterSelect.module.css';

export default function CharacterSelect() {
  const { characters, selectCharacter, createConversation, userId } = useChatContext();
  const router = useRouter();

  const handleSelect = async (characterId: string) => {
    if (!userId) return;
    selectCharacter(characterId);
    const conversationId = await createConversation(characterId, '新しい会話');
    router.push(`/chat/${conversationId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Steampunk AI Chat</h1>
        <p className={styles.subtitle}>キャラクターを選んで会話を始めましょう</p>
      </div>
      <div className={styles.grid}>
        {characters.map((character) => (
          <button
            key={character.id}
            className={styles.card}
            onClick={() => handleSelect(character.id)}
            style={{ '--card-accent': character.color } as React.CSSProperties}
          >
            <div className={styles.avatarWrapper}>
              <img
                src={character.avatar}
                alt={character.name}
                className={styles.avatar}
              />
            </div>
            <h2 className={styles.characterName}>{character.name}</h2>
            <p className={styles.description}>{character.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
