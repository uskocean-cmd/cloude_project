'use client';

import { TodoProvider } from '@/context/TodoContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <TodoProvider>{children}</TodoProvider>;
}
