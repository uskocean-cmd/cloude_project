'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Todo } from '@/types/todo';

interface TodoContextValue {
  todos: Todo[];
  isLoaded: boolean;
  addTodo: (text: string, startDate?: string, endDate?: string) => void;
  deleteTodo: (id: number) => void;
  toggleTodo: (id: number) => void;
  editTodo: (id: number, newText: string) => void;
  updateTodoDates: (id: number, startDate?: string, endDate?: string) => void;
}

const TodoContext = createContext<TodoContextValue | null>(null);

const STORAGE_KEY = 'todo-app-tasks';

function loadTodos(): Todo[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTodos(loadTodos());
    setIsLoaded(true);
  }, []);

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

  return (
    <TodoContext.Provider value={{ todos, isLoaded, addTodo, deleteTodo, toggleTodo, editTodo, updateTodoDates }}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
}
