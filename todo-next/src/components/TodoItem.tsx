'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import type { Todo } from '@/types/todo';
import { useTodoContext } from '@/context/TodoContext';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  todo: Todo;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${y}/${m}/${d}`;
}

export default function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, deleteTodo, editTodo, updateTodoDates } = useTodoContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  const isOverdue = useMemo(() => {
    if (!todo.endDate || todo.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(todo.endDate) < today;
  }, [todo.endDate, todo.completed]);

  const finishEdit = useCallback(() => {
    setIsEditing(false);
    const newText = spanRef.current?.textContent?.trim() || '';
    if (newText) {
      editTodo(todo.id, newText);
    } else {
      deleteTodo(todo.id);
    }
  }, [todo.id, editTodo, deleteTodo]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => {
      const span = spanRef.current;
      if (!span) return;
      span.focus();
      const range = document.createRange();
      range.selectNodeContents(span);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, 0);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      spanRef.current?.blur();
    }
    if (e.key === 'Escape') {
      if (spanRef.current) {
        spanRef.current.textContent = todo.text;
      }
      spanRef.current?.blur();
    }
  }, [todo.text]);

  const handleDateChange = useCallback((field: 'start' | 'end', value: string) => {
    const newStart = field === 'start' ? value : (todo.startDate || '');
    const newEnd = field === 'end' ? value : (todo.endDate || '');
    updateTodoDates(todo.id, newStart || undefined, newEnd || undefined);
  }, [todo.id, todo.startDate, todo.endDate, updateTodoDates]);

  const hasDates = todo.startDate || todo.endDate;

  const itemClassName = `${styles.item}${todo.completed ? ` ${styles.completed}` : ''}`;
  const textClassName = `${styles.text}${isEditing ? ` ${styles.editing}` : ''}`;

  return (
    <li className={itemClassName}>
      <div className={styles.mainRow}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={todo.completed}
          onChange={() => toggleTodo(todo.id)}
        />
        <span
          ref={spanRef}
          className={textClassName}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onDoubleClick={handleDoubleClick}
          onBlur={finishEdit}
          onKeyDown={isEditing ? handleKeyDown : undefined}
        >
          {todo.text}
        </span>
        <button
          className={styles.deleteBtn}
          onClick={() => deleteTodo(todo.id)}
        >
          削除
        </button>
      </div>
      {(hasDates || isEditingDates) && (
        <div className={styles.dateRow}>
          {isEditingDates ? (
            <>
              <input
                type="date"
                className={styles.dateInput}
                value={todo.startDate || ''}
                onChange={e => handleDateChange('start', e.target.value)}
              />
              <span className={styles.dateSeparator}>〜</span>
              <input
                type="date"
                className={styles.dateInput}
                value={todo.endDate || ''}
                onChange={e => handleDateChange('end', e.target.value)}
              />
              <button
                className={styles.dateDoneBtn}
                onClick={() => setIsEditingDates(false)}
              >
                OK
              </button>
            </>
          ) : (
            <span
              className={`${styles.dateDisplay}${isOverdue ? ` ${styles.overdue}` : ''}`}
              onClick={() => setIsEditingDates(true)}
              title="クリックして編集"
            >
              {todo.startDate && formatDate(todo.startDate)}
              {todo.startDate && todo.endDate && ' 〜 '}
              {todo.endDate && formatDate(todo.endDate)}
              {isOverdue && ' (期限切れ)'}
            </span>
          )}
        </div>
      )}
    </li>
  );
}
