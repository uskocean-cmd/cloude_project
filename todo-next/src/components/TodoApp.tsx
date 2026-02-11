'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTodoContext } from '@/context/TodoContext';
import type { FilterType } from '@/types/todo';
import TodoItem from './TodoItem';
import styles from './TodoApp.module.css';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'active', label: '未完了' },
  { key: 'completed', label: '完了済み' },
];

export default function TodoApp() {
  const { todos, isLoaded, addTodo } = useTodoContext();
  const [filter, setFilter] = useState<FilterType>('all');
  const [inputValue, setInputValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (text) {
      addTodo(text, startDate || undefined, endDate || undefined);
      setInputValue('');
      setStartDate('');
      setEndDate('');
    }
  }, [inputValue, startDate, endDate, addTodo]);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const activeCount = useMemo(() => todos.filter(t => !t.completed).length, [todos]);

  if (!isLoaded) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>TODO</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <input
            type="text"
            className={styles.input}
            placeholder="新しいタスクを入力..."
            autoComplete="off"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          <button type="submit" className={styles.submitBtn}>追加</button>
        </div>
        <div className={styles.dateRow}>
          <input
            type="date"
            className={styles.dateInput}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <span className={styles.dateSeparator}>〜</span>
          <input
            type="date"
            className={styles.dateInput}
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </form>

      <div className={styles.filters}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`${styles.filterBtn}${filter === f.key ? ` ${styles.filterBtnActive}` : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className={styles.list}>
        {filteredTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
          />
        ))}
      </ul>

      {todos.length > 0 && (
        <p className={styles.count}>
          {activeCount} 件の未完了タスク / 全 {todos.length} 件
        </p>
      )}
    </div>
  );
}
