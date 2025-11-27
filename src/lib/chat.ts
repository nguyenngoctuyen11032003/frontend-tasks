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

  return {
    id: mockMessage.id,
    chatId: mockMessage.roomId,
    content: mockMessage.content,
    type: mockMessage.type,
    sender,
    attachments: mockMessage.fileUrl
      ? [
          {
            id: `attachment-${mockMessage.id}`,
            name: mockMessage.fileName || "file",
            url: mockMessage.fileUrl,
            size: mockMessage.fileSize || 0,
            type: mockMessage.type === "image" ? "image/jpeg" : "application/pdf",
            uploadedAt: mockMessage.createdAt,
            uploadedBy: sender,
          },
        ]
      : undefined,
    readBy: mockMessage.readBy,
    createdAt: mockMessage.createdAt,
  }
}

// Convert array of mock messages
export function convertMockMessages(mockMessages: MockMessage[]): Message[] {
  return mockMessages.map(convertMockMessage)
}
