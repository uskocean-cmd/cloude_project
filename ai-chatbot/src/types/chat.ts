export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  avatar: string;
  systemPrompt: string;
  color: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  characterId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
