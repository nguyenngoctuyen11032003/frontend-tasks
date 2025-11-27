"use client";

import { useState } from "react";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ["G", "D"], description: "Đi tới Dashboard", category: "Điều hướng" },
  { keys: ["G", "T"], description: "Đi tới Công việc", category: "Điều hướng" },
  { keys: ["G", "P"], description: "Đi tới Dự án", category: "Điều hướng" },
  { keys: ["G", "N"], description: "Đi tới Ghi chú", category: "Điều hướng" },
  { keys: ["G", "C"], description: "Đi tới Chat", category: "Điều hướng" },
  { keys: ["G", "M"], description: "Đi tới Nhóm", category: "Điều hướng" },
  { keys: ["G", "S"], description: "Đi tới Cài đặt", category: "Điều hướng" },

  // Actions
  { keys: ["N"], description: "Tạo mới", category: "Hành động" },
  { keys: ["Ctrl", "K"], description: "Mở Command Palette", category: "Hành động" },
  { keys: ["/"], description: "Tìm kiếm", category: "Hành động" },
  { keys: ["?"], description: "Hiện phím tắt", category: "Hành động" },
  { keys: ["Esc"], description: "Đóng dialog/panel", category: "Hành động" },

  // Task Management
  { keys: ["C"], description: "Tạo công việc mới", category: "Công việc" },
  { keys: ["E"], description: "Chỉnh sửa công việc", category: "Công việc" },
  { keys: ["D"], description: "Xóa công việc", category: "Công việc" },
  { keys: ["A"], description: "Giao công việc", category: "Công việc" },
  { keys: ["M"], description: "Di chuyển công việc", category: "Công việc" },

  // View Controls
  { keys: ["V", "K"], description: "Chế độ Kanban", category: "Hiển thị" },
  { keys: ["V", "L"], description: "Chế độ List", category: "Hiển thị" },
  { keys: ["V", "C"], description: "Chế độ Calendar", category: "Hiển thị" },
  { keys: ["T"], description: "Chuyển theme", category: "Hiển thị" },

  // Editor
  { keys: ["Ctrl", "B"], description: "In đậm", category: "Soạn thảo" },
  { keys: ["Ctrl", "I"], description: "In nghiêng", category: "Soạn thảo" },
  { keys: ["Ctrl", "U"], description: "Gạch chân", category: "Soạn thảo" },
  { keys: ["Ctrl", "S"], description: "Lưu", category: "Soạn thảo" },
  { keys: ["Ctrl", "Z"], description: "Hoàn tác", category: "Soạn thảo" },
  { keys: ["Ctrl", "Shift", "Z"], description: "Làm lại", category: "Soạn thảo" },

  // General
  { keys: ["Ctrl", "P"], description: "In trang", category: "Chung" },
  { keys: ["Ctrl", ","], description: "Mở Cài đặt", category: "Chung" },
  { keys: ["Shift", "?"], description: "Trợ giúp", category: "Chung" },
];

export function KeyboardShortcutsPanel() {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcut({
    key: "?",
    shift: true,
    handler: () => setIsOpen(true),
    description: "Open keyboard shortcuts",
  });

  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, Shortcut[]>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Phím tắt</DialogTitle>
          <DialogDescription>
            Danh sách các phím tắt để tăng hiệu suất làm việc
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <Kbd>{key}</Kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-xs text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {Object.keys(groupedShortcuts).indexOf(category) <
                  Object.keys(groupedShortcuts).length - 1 && (
                  <Separator className="mt-6" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Nhấn <Kbd>?</Kbd> để mở/đóng panel này
          </p>
          <p className="text-xs text-muted-foreground">
            <Kbd>Esc</Kbd> để đóng
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
