"use client";

import { FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyNotesProps {
  hasFilters?: boolean;
  onCreateNote?: () => void;
  onClearFilters?: () => void;
}

export function EmptyNotes({ hasFilters, onCreateNote, onClearFilters }: EmptyNotesProps) {
  if (hasFilters) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy ghi chú</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Không có ghi chú nào khớp với tìm kiếm của bạn. Thử từ khóa khác hoặc xóa bộ lọc.
          </p>
          {onClearFilters && (
            <Button onClick={onClearFilters} variant="outline">
              Xóa bộ lọc
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Chưa có ghi chú nào</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Tạo ghi chú đầu tiên để lưu trữ ý tưởng, meeting notes hoặc tài liệu quan trọng. 
          Hỗ trợ rich text, tag và tìm kiếm nhanh.
        </p>
        {onCreateNote && (
          <Button onClick={onCreateNote}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo ghi chú đầu tiên
          </Button>
        )}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-2xl">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">✍️ Rich Text</div>
            <p className="text-xs text-muted-foreground">
              Định dạng văn bản với editor đầy đủ
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">🏷️ Tổ chức</div>
            <p className="text-xs text-muted-foreground">
              Dùng tag và category để sắp xếp
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">🔍 Tìm kiếm</div>
            <p className="text-xs text-muted-foreground">
              Tìm nội dung nhanh chóng và chính xác
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
