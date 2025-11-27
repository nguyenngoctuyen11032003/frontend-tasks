import { toast } from "@/lib/toast";

// Task-related toasts
export const taskToasts = {
  created: () => toast.success("Công việc đã được tạo thành công"),
  
  updated: () => toast.success("Công việc đã được cập nhật"),
  
  deleted: () =>
    toast.success("Công việc đã được xóa", {
      action: {
        label: "Hoàn tác",
        onClick: () => {
          // TODO: Implement undo functionality
          toast.info("Đang khôi phục...");
        },
      },
    }),
  
  statusChanged: (status: string) =>
    toast.success(`Trạng thái đã chuyển sang "${status}"`),
  
  assigned: (userName: string) =>
    toast.success(`Đã giao việc cho ${userName}`),
  
  duplicated: () =>
    toast.success("Công việc đã được nhân bản", {
      action: {
        label: "Xem",
        onClick: () => {
          // Navigate to duplicated task
        },
      },
    }),
  
  error: (message?: string) =>
    toast.error(message || "Không thể thực hiện thao tác với công việc"),
};

// Project-related toasts
export const projectToasts = {
  created: () => toast.success("Dự án đã được tạo thành công"),
  
  updated: () => toast.success("Dự án đã được cập nhật"),
  
  deleted: () =>
    toast.success("Dự án đã được xóa", {
      action: {
        label: "Hoàn tác",
        onClick: () => {
          toast.info("Đang khôi phục...");
        },
      },
    }),
  
  archived: () => toast.success("Dự án đã được lưu trữ"),
  
  memberAdded: (userName: string) =>
    toast.success(`${userName} đã được thêm vào dự án`),
  
  memberRemoved: (userName: string) =>
    toast.success(`${userName} đã bị xóa khỏi dự án`),
  
  error: (message?: string) =>
    toast.error(message || "Không thể thực hiện thao tác với dự án"),
};

// Note-related toasts
export const noteToasts = {
  created: () => toast.success("Ghi chú đã được tạo"),
  
  updated: () => toast.success("Ghi chú đã được lưu"),
  
  deleted: () =>
    toast.success("Ghi chú đã được xóa", {
      action: {
        label: "Hoàn tác",
        onClick: () => {
          toast.info("Đang khôi phục...");
        },
      },
    }),
  
  shared: () => toast.success("Ghi chú đã được chia sẻ"),
  
  error: (message?: string) =>
    toast.error(message || "Không thể thực hiện thao tác với ghi chú"),
};

// Chat/Message toasts
export const messageToasts = {
  sent: () => toast.success("Tin nhắn đã được gửi"),
  
  deleted: () => toast.success("Tin nhắn đã được xóa"),
  
  edited: () => toast.success("Tin nhắn đã được chỉnh sửa"),
  
  connectionLost: () =>
    toast.error("Mất kết nối chat", {
      action: {
        label: "Kết nối lại",
        onClick: () => {
          // Reconnect logic
          toast.loading("Đang kết nối lại...");
        },
      },
    }),
  
  connectionRestored: () => toast.success("Đã kết nối lại chat"),
  
  error: (message?: string) =>
    toast.error(message || "Không thể gửi tin nhắn"),
};

// Team/User toasts
export const teamToasts = {
  invited: (email: string) =>
    toast.success(`Đã gửi lời mời đến ${email}`),
  
  removed: (userName: string) =>
    toast.success(`${userName} đã bị xóa khỏi nhóm`),
  
  roleChanged: (userName: string, role: string) =>
    toast.success(`Vai trò của ${userName} đã được đổi thành ${role}`),
  
  joined: (userName: string) =>
    toast.info(`${userName} đã tham gia nhóm`),
  
  left: (userName: string) =>
    toast.info(`${userName} đã rời khỏi nhóm`),
  
  error: (message?: string) =>
    toast.error(message || "Không thể thực hiện thao tác với thành viên"),
};

// File upload toasts
export const fileToasts = {
  uploading: (fileName: string) =>
    toast.loading(`Đang tải lên ${fileName}...`),
  
  uploaded: (fileName: string) =>
    toast.success(`${fileName} đã được tải lên`),
  
  uploadError: (fileName: string) =>
    toast.error(`Không thể tải lên ${fileName}`),
  
  sizeExceeded: (maxSize: string) =>
    toast.warning(`Kích thước file vượt quá ${maxSize}`),
  
  invalidType: () =>
    toast.warning("Định dạng file không được hỗ trợ"),
};

// Auth toasts
export const authToasts = {
  loginSuccess: () => toast.success("Đăng nhập thành công"),
  
  logoutSuccess: () => toast.success("Đã đăng xuất"),
  
  sessionExpired: () =>
    toast.warning("Phiên đăng nhập đã hết hạn", {
      action: {
        label: "Đăng nhập lại",
        onClick: () => {
          window.location.href = "/login";
        },
      },
    }),
  
  unauthorized: () =>
    toast.error("Bạn không có quyền thực hiện thao tác này"),
  
  error: (message?: string) =>
    toast.error(message || "Đăng nhập không thành công"),
};

// System toasts
export const systemToasts = {
  saved: () => toast.success("Đã lưu thay đổi"),
  
  copying: () => toast.success("Đã sao chép vào clipboard"),
  
  networkError: () =>
    toast.error("Lỗi kết nối mạng", {
      action: {
        label: "Thử lại",
        onClick: () => {
          window.location.reload();
        },
      },
    }),
  
  maintenanceMode: () =>
    toast.warning("Hệ thống đang bảo trì. Vui lòng thử lại sau."),
  
  updateAvailable: () =>
    toast.info("Có phiên bản mới", {
      action: {
        label: "Cập nhật",
        onClick: () => {
          window.location.reload();
        },
      },
      duration: 10000,
    }),
};

// Export all toast groups
export const toasts = {
  task: taskToasts,
  project: projectToasts,
  note: noteToasts,
  message: messageToasts,
  team: teamToasts,
  file: fileToasts,
  auth: authToasts,
  system: systemToasts,
};
