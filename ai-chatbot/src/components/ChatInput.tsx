'use client';

import { useState, useCallback, type KeyboardEvent, type FormEvent } from 'react';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSend: (text: string) => void;
  isDisabled: boolean;
}

export default function ChatInput({ onSend, isDisabled }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || isDisabled) return;
      onSend(trimmed);
      setText('');
    },
    [text, isDisabled, onSend]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || isDisabled) return;
        onSend(trimmed);
        setText('');
      }
    },
    [text, isDisabled, onSend]
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="メッセージを入力..."
        disabled={isDisabled}
        rows={1}
      />
      <button
        type="submit"
        className={styles.sendButton}
        disabled={isDisabled || !text.trim()}
      >
        送信
      </button>
    </form>
  );
}
