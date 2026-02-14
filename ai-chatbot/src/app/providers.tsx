'use client';

import { ChatProvider } from '@/context/ChatContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ChatProvider>{children}</ChatProvider>;
}
