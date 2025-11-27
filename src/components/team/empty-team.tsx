"use client";

import { Users, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyTeamProps {
  hasFilters?: boolean;
  onInviteMember?: () => void;
  onClearFilters?: () => void;
}

export function EmptyTeam({ hasFilters, onInviteMember, onClearFilters }: EmptyTeamProps) {
  if (hasFilters) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy thành viên</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Không có thành viên nào khớp với tìm kiếm của bạn. Thử từ khóa khác hoặc xóa bộ lọc.
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
          <Users className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Chưa có thành viên nào</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Mời thành viên vào team để bắt đầu cộng tác. 
          Chia sẻ dự án, phân công công việc và chat realtime cùng nhau.
        </p>
        {onInviteMember && (
          <Button onClick={onInviteMember}>
            <UserPlus className="mr-2 h-4 w-4" />
            Mời thành viên đầu tiên
          </Button>
        )}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-2xl">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">🤝 Cộng tác</div>
            <p className="text-xs text-muted-foreground">
              Làm việc nhóm hiệu quả trên cùng dự án
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">💬 Giao tiếp</div>
            <p className="text-xs text-muted-foreground">
              Chat và thảo luận realtime với team
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">👁️ Theo dõi</div>
            <p className="text-xs text-muted-foreground">
              Xem hoạt động và tiến độ của members
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
