import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { connectToDatabase } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import { getCharacterById } from '@/lib/characters';

export const maxDuration = 30;

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const characterId = url.searchParams.get('characterId') ?? '';
  const conversationId = url.searchParams.get('conversationId');
  const userId = url.searchParams.get('userId');

  const body = await req.json();
  const messages: IncomingMessage[] = body.messages ?? [];

  const character = getCharacterById(characterId);
  if (!character) {
    return new Response('Character not found', { status: 400 });
  }

  const lastUserMessage = messages[messages.length - 1];
  const userContent = lastUserMessage?.content ?? '';

  const result = streamText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    system: character.systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    onFinish: async ({ text }) => {
      if (conversationId && userId) {
        try {
          await connectToDatabase();
          await Conversation.findByIdAndUpdate(conversationId, {
            $push: {
              messages: {
                $each: [
                  { role: 'user', content: userContent, timestamp: new Date() },
                  { role: 'assistant', content: text, timestamp: new Date() },
                ],
              },
            },
            updatedAt: new Date(),
          });
        } catch (error) {
          console.error('Failed to save messages:', error);
        }
      }
    },
  });

  return result.toTextStreamResponse();
}
