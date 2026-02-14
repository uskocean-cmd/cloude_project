import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  await connectToDatabase();
  const conversations = await Conversation.find({ userId })
    .select('_id characterId title createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const { userId, characterId, title, messages } = await req.json();

  if (!userId || !characterId || !title) {
    return NextResponse.json(
      { error: 'userId, characterId, and title are required' },
      { status: 400 }
    );
  }

  await connectToDatabase();
  const conversation = await Conversation.create({
    userId,
    characterId,
    title,
    messages: messages || [],
  });

  return NextResponse.json(conversation);
}
