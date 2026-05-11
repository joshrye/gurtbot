export type MessageMetadata = {
  messageId: string;
  repliedToMessageId?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
};

export type Turn = { role: 'user' | 'model'; text: string; metadata: MessageMetadata };
