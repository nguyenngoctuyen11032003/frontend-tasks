import { io, Socket } from "socket.io-client"
import type { Message, Task } from "@/types"

type MessageCallback = (payload: { chatId: string; message: Message }) => void
type TaskCallback = (payload: { taskId: string; changes: Partial<Task> }) => void
type TypingCallback = (payload: { chatId: string; userId: string }) => void
type UserCallback = (payload: { userId: string }) => void
type NotificationCallback = (payload: { notification: any }) => void

class SocketClient {
  private socket: Socket | null = null
  private connected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(token: string) {
    if (this.connected && this.socket?.connected) {
      console.log("[Socket] Already connected")
      return
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on("connect", () => {
      console.log("[Socket] Connected:", this.socket?.id)
      this.connected = true
      this.reconnectAttempts = 0
    })

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason)
      this.connected = false

      // Auto reconnect if disconnected unexpectedly
      if (reason === "io server disconnect") {
        // Server forced disconnect, try to reconnect
        this.socket?.connect()
      }
    })

    this.socket.on("connect_error", (error) => {
      // Silently handle connection errors in production
      // This is expected when backend is not running
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        // Stop trying to reconnect after max attempts
        this.socket?.close()
      }
    })

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("[Socket] Reconnected after", attemptNumber, "attempts")
      this.reconnectAttempts = 0
    })

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      // Silently handle reconnect attempts
    })

    this.socket.on("reconnect_error", (error) => {
      // Silently handle reconnect errors
    })

    this.socket.on("reconnect_failed", () => {
      // Silently handle reconnection failure
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
      console.log("[Socket] Disconnected")
    }
  }

  isConnected(): boolean {
    return this.connected && this.socket?.connected === true
  }

  // Event listeners
  onNewMessage(callback: MessageCallback) {
    if (!this.socket) return () => {}
    this.socket.on("message:new", callback)
    return () => this.socket?.off("message:new", callback)
  }

  onTaskUpdate(callback: TaskCallback) {
    if (!this.socket) return () => {}
    this.socket.on("task:update", callback)
    return () => this.socket?.off("task:update", callback)
  }

  onUserTyping(callback: TypingCallback) {
    if (!this.socket) return () => {}
    this.socket.on("user:typing", callback)
    return () => this.socket?.off("user:typing", callback)
  }

  onUserStopTyping(callback: TypingCallback) {
    if (!this.socket) return () => {}
    this.socket.on("user:stopTyping", callback)
    return () => this.socket?.off("user:stopTyping", callback)
  }

  onUserOnline(callback: UserCallback) {
    if (!this.socket) return () => {}
    this.socket.on("user:online", callback)
    return () => this.socket?.off("user:online", callback)
  }

  onUserOffline(callback: UserCallback) {
    if (!this.socket) return () => {}
    this.socket.on("user:offline", callback)
    return () => this.socket?.off("user:offline", callback)
  }

  onNotification(callback: NotificationCallback) {
    if (!this.socket) return () => {}
    this.socket.on("notification:new", callback)
    return () => this.socket?.off("notification:new", callback)
  }

  // Emit events
  sendMessage(chatId: string, content: string, type: "text" | "image" | "file" = "text") {
    if (!this.socket || !this.connected) {
      console.error("[Socket] Not connected, cannot send message")
      return
    }
    this.socket.emit("message:send", { chatId, content, type })
  }

  startTyping(chatId: string) {
    if (!this.socket || !this.connected) return
    this.socket.emit("user:startTyping", { chatId })
  }

  stopTyping(chatId: string) {
    if (!this.socket || !this.connected) return
    this.socket.emit("user:stopTyping", { chatId })
  }

  joinChat(chatId: string) {
    if (!this.socket || !this.connected) return
    this.socket.emit("chat:join", { chatId })
    console.log("[Socket] Joined chat:", chatId)
  }

  leaveChat(chatId: string) {
    if (!this.socket || !this.connected) return
    this.socket.emit("chat:leave", { chatId })
    console.log("[Socket] Left chat:", chatId)
  }

  updateTaskStatus(taskId: string, status: string) {
    if (!this.socket || !this.connected) return
    this.socket.emit("task:updateStatus", { taskId, status })
  }

  // Helper to emit custom events
  emit(event: string, data: any) {
    if (!this.socket || !this.connected) {
      console.error(`[Socket] Not connected, cannot emit ${event}`)
      return
    }
    this.socket.emit(event, data)
  }

  // Helper to listen to custom events
  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) return () => {}
    this.socket.on(event, callback)
    return () => this.socket?.off(event, callback)
  }
}

export const socketClient = new SocketClient()
export default socketClient

