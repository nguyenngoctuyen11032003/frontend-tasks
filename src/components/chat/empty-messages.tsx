"use client";

import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyMessagesProps {
  chatName?: string;
  isGroupChat?: boolean;
}

export function EmptyMessages({ chatName, isGroupChat }: EmptyMessagesProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-4">
      <div className="rounded-full bg-primary/10 p-6 mb-4">
        <MessageSquare className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {chatName ? `Chat với ${chatName}` : "Chưa có tin nhắn"}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
        {isGroupChat
          ? "Đây là khởi đầu của cuộc trò chuyện nhóm. Gửi tin nhắn đầu tiên để bắt đầu thảo luận với các thành viên."
          : "Đây là khởi đầu của cuộc trò chuyện. Gửi tin nhắn đầu tiên để bắt đầu."}
      </p>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Send className="h-4 w-4" />
        <span>Nhập tin nhắn bên dưới để bắt đầu</span>
      </div>
    </div>
  );
}

export function EmptyChatList() {
  return (
    <Card className="border-dashed m-4">
      <CardContent className="flex flex-col items-center justify-center py-12 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <MessageSquare className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-2">Chưa có cuộc trò chuyện</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Chọn một thành viên từ danh sách team để bắt đầu trò chuyện
        </p>
      </CardContent>
    </Card>
  );
}

export function NoChatSelected() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-4 bg-muted/30">
      <div className="rounded-full bg-muted p-8 mb-4">
        <MessageSquare className="h-16 w-16 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Chọn một cuộc trò chuyện</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        Chọn một cuộc trò chuyện từ danh sách bên trái hoặc bắt đầu cuộc trò chuyện mới
      </p>
    </div>
  );
}
