import type { Message, User } from "@/types"

// Temporary mock message type matching existing data structure
export interface MockMessage {
  id: string
  roomId: string
  senderId: string
  content: string
  type: "text" | "image" | "file"
  createdAt: string
  readBy: string[]
  fileName?: string
  fileUrl?: string
  fileSize?: number
}

// Note: These conversion functions are deprecated
// Use real API data instead of mock data
export function convertMockMessage(mockMessage: MockMessage): Message {
  return {
    id: mockMessage.id,
    chatId: mockMessage.roomId,
    content: mockMessage.content,
    type: mockMessage.type,
    sender: { id: mockMessage.senderId, name: 'User', email: '' } as User,
    attachmentUrls: mockMessage.fileUrl ? [mockMessage.fileUrl] : undefined,
    readBy: [],
    createdAt: mockMessage.createdAt,
  }
}

// Convert array of mock messages
export function convertMockMessages(mockMessages: MockMessage[]): Message[] {
  return mockMessages.map(convertMockMessage)
}
