import { useAuthStore } from "@/stores/auth-store"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// ==================== Types ====================
export interface SendEmailDto {
  to: string | string[]
  subject: string
  content: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    path: string
  }>
}

export interface EmailStats {
  totalSent: number
  totalFailed: number
  lastSentAt?: string
  successRate: number
}

export interface EmailResponse {
  success: boolean
  message: string
  messageId?: string
  timestamp: string
}

// ==================== Helper Functions ====================
const getAuthToken = () => {
  const { token } = useAuthStore.getState()
  if (!token) {
    throw new Error("Chưa đăng nhập. Vui lòng đăng nhập lại.")
  }
  return token
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 401) {
    useAuthStore.getState().logout()
    throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.")
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

// ==================== Email API ====================
export class EmailService {
  /**
   * Send email
   * POST /email/send
   */
  static async sendEmail(data: SendEmailDto): Promise<EmailResponse> {
    const token = getAuthToken()

    // Normalize to and cc/bcc to arrays if needed
    const payload = {
      ...data,
      to: Array.isArray(data.to) ? data.to : [data.to],
      cc: data.cc ? (Array.isArray(data.cc) ? data.cc : [data.cc]) : undefined,
      bcc: data.bcc ? (Array.isArray(data.bcc) ? data.bcc : [data.bcc]) : undefined,
    }

    const response = await fetch(`${API_BASE_URL}/email/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    return handleResponse<EmailResponse>(response)
  }

  /**
   * Get email statistics
   * GET /email/stats
   */
  static async getEmailStats(): Promise<EmailStats> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/email/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<EmailStats>(response)
  }

  /**
   * Send notification email (helper method)
   * Used for sending system notifications via email
   */
  static async sendNotificationEmail(
    to: string | string[],
    subject: string,
    message: string
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      subject,
      content: message,
    })
  }

  /**
   * Send task assignment email (helper method)
   */
  static async sendTaskAssignmentEmail(
    to: string,
    taskTitle: string,
    projectName: string,
    dueDate?: string
  ): Promise<EmailResponse> {
    const subject = `Nhiệm vụ mới: ${taskTitle}`
    const content = `
      <h2>Bạn đã được giao nhiệm vụ mới</h2>
      <p><strong>Tên nhiệm vụ:</strong> ${taskTitle}</p>
      <p><strong>Dự án:</strong> ${projectName}</p>
      ${dueDate ? `<p><strong>Hạn chót:</strong> ${dueDate}</p>` : ""}
      <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết.</p>
    `

    return this.sendEmail({
      to,
      subject,
      content,
    })
  }

  /**
   * Send invitation email (helper method)
   */
  static async sendInvitationEmail(
    to: string,
    inviterName: string,
    inviteLink: string
  ): Promise<EmailResponse> {
    const subject = `${inviterName} đã mời bạn tham gia dự án`
    const content = `
      <h2>Lời mời tham gia</h2>
      <p>${inviterName} đã mời bạn tham gia vào hệ thống quản lý dự án.</p>
      <p>Nhấp vào liên kết dưới đây để chấp nhận lời mời:</p>
      <p><a href="${inviteLink}">${inviteLink}</a></p>
      <p>Liên kết này sẽ hết hạn sau 7 ngày.</p>
    `

    return this.sendEmail({
      to,
      subject,
      content,
    })
  }

  /**
   * Send reminder email (helper method)
   */
  static async sendReminderEmail(
    to: string,
    reminderTitle: string,
    reminderMessage: string,
    reminderTime: string
  ): Promise<EmailResponse> {
    const subject = `Nhắc nhở: ${reminderTitle}`
    const content = `
      <h2>Nhắc nhở nhiệm vụ</h2>
      <p><strong>${reminderTitle}</strong></p>
      <p>${reminderMessage}</p>
      <p><strong>Thời gian:</strong> ${reminderTime}</p>
    `

    return this.sendEmail({
      to,
      subject,
      content,
    })
  }
}

// Export singleton instance
export const emailService = EmailService
