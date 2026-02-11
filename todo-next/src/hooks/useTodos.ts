'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Todo } from '@/types/todo';

const STORAGE_KEY = 'todo-app-tasks';

function loadTodos(): Todo[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setTodos(loadTodos());
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  const addTodo = useCallback((text: string, startDate?: string, endDate?: string) => {
    setTodos(prev => [...prev, { id: Date.now(), text, completed: false, startDate, endDate }]);
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTodo = useCallback((id: number) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const editTodo = useCallback((id: number, newText: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, text: newText } : t))
    );
  }, []);

  const updateTodoDates = useCallback((id: number, startDate?: string, endDate?: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, startDate, endDate } : t))
    );
  }, []);

  return { todos, isLoaded, addTodo, deleteTodo, toggleTodo, editTodo, updateTodoDates };
}
