"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, X, Send, Sparkles, Trash2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUIStore } from "@/stores/ui-store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn, formatTime } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function FloatingChat() {
  const { chatDrawerOpen, toggleChatDrawer, setChatDrawerOpen } = useUIStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Xin chào! Tôi là AI Assistant của TaskMaster. Tôi có thể giúp bạn quản lý công việc, dự án và trả lời các câu hỏi. Bạn cần tôi hỗ trợ điều gì?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(inputMessage),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    
    if (input.includes("công việc") || input.includes("task")) {
      return "Tôi có thể giúp bạn tạo công việc mới, cập nhật trạng thái, hoặc tìm kiếm công việc. Bạn muốn làm gì?"
    } else if (input.includes("dự án") || input.includes("project")) {
      return "Về dự án, tôi có thể giúp bạn tạo dự án mới, xem tiến độ, quản lý thành viên. Bạn cần hỗ trợ cụ thể gì?"
    } else if (input.includes("báo cáo") || input.includes("report")) {
      return "Tôi có thể tạo báo cáo về tiến độ công việc, hiệu suất đội nhóm, hoặc tổng hợp dữ liệu. Bạn muốn báo cáo loại nào?"
    } else if (input.includes("team") || input.includes("nhóm") || input.includes("đội")) {
      return "Tôi có thể giúp bạn quản lý thành viên, phân công nhiệm vụ, hoặc xem hiệu suất làm việc của đội nhóm. Bạn cần gì?"
    } else if (input.includes("thông báo") || input.includes("notification")) {
      return "Tôi có thể cấu hình thông báo cho bạn, hoặc hiển thị các thông báo quan trọng. Bạn muốn làm gì với thông báo?"
    } else if (input.includes("tạo") || input.includes("create")) {
      return "Bạn muốn tạo gì? Tôi có thể giúp tạo công việc mới, dự án mới, ghi chú, hoặc báo cáo."
    } else if (input.includes("xin chào") || input.includes("hello") || input.includes("hi")) {
      return "Xin chào! Rất vui được hỗ trợ bạn. Bạn cần tôi giúp gì hôm nay?"
    } else if (input.includes("cảm ơn") || input.includes("thank")) {
      return "Không có gì! Tôi luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào. Còn gì khác tôi có thể giúp không?"
    }
    
    return "Tôi hiểu rồi. Tôi có thể giúp bạn với các vấn đề về quản lý công việc, dự án, nhóm, và báo cáo. Hãy cho tôi biết cụ thể hơn về điều bạn cần nhé!"
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Xin chào! Tôi là AI Assistant của TaskMaster. Tôi có thể giúp bạn quản lý công việc, dự án và trả lời các câu hỏi. Bạn cần tôi hỗ trợ điều gì?",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!chatDrawerOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-20 right-4 z-50 md:bottom-6"
          >
            <Button 
              onClick={toggleChatDrawer} 
              size="lg" 
              className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Bot className="h-6 w-6" />
              <span className="sr-only">Mở AI Chat</span>
            </Button>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat drawer */}
      <AnimatePresence>
        {chatDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 h-[80vh] rounded-t-2xl border-t bg-gradient-to-b from-background to-background/95 shadow-2xl md:bottom-6 md:left-auto md:right-6 md:h-[600px] md:w-[420px] md:rounded-2xl md:border"
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-600">
                        <AvatarFallback className="bg-transparent">
                          <Bot className="h-6 w-6 text-white" />
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        AI Assistant
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Beta
                        </Badge>
                      </h3>
                      <p className="text-xs text-muted-foreground">Luôn sẵn sàng hỗ trợ</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handleClearChat} title="Xóa lịch sử chat">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setChatDrawerOpen(false)}>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Đóng</span>
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 shrink-0">
                            <AvatarFallback className="bg-transparent">
                              <Bot className="h-5 w-5 text-white" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted",
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        {message.role === "user" && (
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        )}
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 items-start"
                      >
                        <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600">
                          <AvatarFallback className="bg-transparent">
                            <Bot className="h-5 w-5 text-white" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <motion.div
                              className="h-2 w-2 rounded-full bg-foreground/50"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="h-2 w-2 rounded-full bg-foreground/50"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="h-2 w-2 rounded-full bg-foreground/50"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t p-4 bg-background/50 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Hỏi AI Assistant..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="flex-1"
                      disabled={isTyping}
                    />
                    <Button 
                      size="icon" 
                      onClick={handleSendMessage} 
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
