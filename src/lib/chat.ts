import type { Message, User } from "@/types"
import { mockUsers } from "@/mocks/data"

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

// Convert MockMessage to Message with proper User objects
export function convertMockMessage(mockMessage: MockMessage): Message {
  const sender = mockUsers.find((u) => u.id === mockMessage.senderId) || mockUsers[0]
  const readByUsers = mockMessage.readBy
    .map((userId) => mockUsers.find((u) => u.id === userId))
    .filter((user): user is User => user !== undefined)

  return {
    id: mockMessage.id,
    chatId: mockMessage.roomId,
    content: mockMessage.content,
    type: mockMessage.type,
    sender,
    attachmentUrls: mockMessage.fileUrl ? [mockMessage.fileUrl] : undefined,
    readBy: readByUsers,
    createdAt: mockMessage.createdAt,
  }
}

// Convert array of mock messages
export function convertMockMessages(mockMessages: MockMessage[]): Message[] {
  return mockMessages.map(convertMockMessage)
}
