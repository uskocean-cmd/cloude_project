'use client';

import Markdown from 'react-markdown';
import type { Character } from '@/types/chat';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  character?: Character | null;
}

export default function ChatMessage({ role, content, character }: ChatMessageProps) {
  return (
    <div className={`${styles.message} ${styles[role]}`}>
      {role === 'assistant' && character && (
        <div
          className={styles.avatarWrapper}
          style={{ borderColor: character.color }}
        >
          <img
            src={character.avatar}
            alt={character.name}
            className={styles.avatar}
          />
        </div>
      )}
      <div className={`${styles.bubble} ${styles[`${role}Bubble`]}`}>
        {role === 'assistant' && character && (
          <span className={styles.characterName} style={{ color: character.color }}>
            {character.name}
          </span>
        )}
        <div className={styles.content}>
          {role === 'assistant' ? (
            <Markdown>{content}</Markdown>
          ) : (
            <p>{content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
