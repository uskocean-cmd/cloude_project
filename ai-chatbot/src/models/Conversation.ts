import mongoose, { Schema, type Document } from 'mongoose';

interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  userId: string;
  characterId: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ConversationSchema = new Schema<IConversation>(
  {
    userId: { type: String, required: true, index: true },
    characterId: { type: String, required: true },
    title: { type: String, required: true },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);
