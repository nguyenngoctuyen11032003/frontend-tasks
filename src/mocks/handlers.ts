import { http, HttpResponse, delay } from "msw"
import {
  mockUsers,
  mockProjects,
  mockTasks,
  mockNotes,
  mockChatRooms,
  mockMessages,
  currentUser,
} from "./data"
import type { User, Project, Task, Note, PaginatedResponse, Message } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Realistic delay for mock responses
const MOCK_DELAY = 300

export const handlers = [
  // ==================== AUTH ====================
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    await delay(MOCK_DELAY)
    const body = (await request.json()) as { email: string; password: string }

    // Simple mock authentication
    const user = mockUsers.find((u) => u.email === body.email)
    if (!user) {
      return HttpResponse.json({ message: "Email hoặc mật khẩu không đúng" }, { status: 401 })
    }

    // Mock token
    const token = `mock-token-${user.id}-${Date.now()}`

    return HttpResponse.json({
      token,
      user,
    })
  }),

  http.post(`${API_BASE_URL}/auth/forgot-password`, async ({ request }) => {
    await delay(MOCK_DELAY)
    const body = (await request.json()) as { email: string }

    return HttpResponse.json({
      message: `Đã gửi email khôi phục mật khẩu đến ${body.email}`,
    })
  }),

  http.get(`${API_BASE_URL}/auth/profile`, async () => {
    await delay(MOCK_DELAY)
    return HttpResponse.json(currentUser)
  }),

  // ==================== PROJECTS ====================
  http.get(`${API_BASE_URL}/projects`, async () => {
    await delay(MOCK_DELAY)
    return HttpResponse.json(mockProjects)
  }),

  http.get(`${API_BASE_URL}/projects/:id`, async ({ params }) => {
    await delay(MOCK_DELAY)
    const project = mockProjects.find((p) => p.id === params.id)
    if (!project) {
      return HttpResponse.json({ message: "Không tìm thấy dự án" }, { status: 404 })
    }
    return HttpResponse.json(project)
  }),

  http.post(`${API_BASE_URL}/projects`, async ({ request }) => {
    await delay(MOCK_DELAY)
    const body = (await request.json()) as Partial<Project>

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: body.name || "New Project",
      description: body.description || "",
      color: body.color || "#3b82f6",
      status: body.status || "active",
      progress: 0,
      members: body.members || [currentUser.id],
      tags: body.tags || [],
      deadline: body.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json(newProject, { status: 201 })
  }),

  http.patch(`${API_BASE_URL}/projects/:id`, async ({ params, request }) => {
    await delay(MOCK_DELAY)
    const body = (await request.json()) as Partial<Project>
    const project = mockProjects.find((p) => p.id === params.id)

    if (!project) {
      return HttpResponse.json({ message: "Không tìm thấy dự án" }, { status: 404 })
    }

    const updatedProject = { ...project, ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json(updatedProject)
  }),

  http.delete(`${API_BASE_URL}/projects/:id`, async ({ params }) => {
    await delay(MOCK_DELAY)
    const project = mockProjects.find((p) => p.id === params.id)

    if (!project) {
      return HttpResponse.json({ message: "Không tìm thấy dự án" }, { status: 404 })
    }

    return HttpResponse.json({ message: "Xóa dự án thành công" })
  }),

  // ==================== TASKS ====================
  http.get(`${API_BASE_URL}/tasks`, async ({ request }) => {
    await delay(MOCK_DELAY)
    const url = new URL(request.url)
    const projectId = url.searchParams.get("projectId")
    const status = url.searchParams.get("status")
    const assignee = url.searchParams.get("assignee")
    const page = Number(url.searchParams.get("page")) || 1
    const pageSize = 20

    let filteredTasks = [...mockTasks]

    if (projectId) {
      filteredTasks = filteredTasks.filter((t) => t.projectId === projectId)
    }
    if (status) {
      filteredTasks = filteredTasks.filter((t) => t.status === status)
    }
    if (assignee) {
      filteredTasks = filteredTasks.filter((t) => t.assignees.some((a) => a.id === assignee))
    }

    const total = filteredTasks.length
    const start = (page - 1) * pageSize
    const items = filteredTasks.slice(start, start + pageSize)

    const response: PaginatedResponse<Task> = {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }

    return HttpResponse.json(response)
  }),

  http.get(`${API_BASE_URL}/tasks/:id`, async ({ params }) => {
    await delay(MOCK_DELAY)
    const task = mockTasks.find((t) => t.id === params.id)
    if (!task) {
      return HttpResponse.json({ message: "Không tìm thấy công việc" }, { status: 404 })
    }
    return HttpResponse.json(task)
  }),

  http.post(`${API_BASE_URL}/tasks`, async ({ request }) => {
    await delay(MOCK_DELAY)
    const body = (await request.json()) as Partial<Task>

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: body.title || "New Task",
      description: body.description || "",
      status: body.status || "todo",
      priority: body.priority || "medium",
      assignees: body.assignees || [currentUser],
      projectId: body.projectId || mockProjects[0].id,
      dueDate: body.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commentsCount: 0,
      estimatedHours: body.estimatedHours || 0,
      tags: body.tags || [],
      checklist: body.checklist || [],
      attachments: body.attachments || [],
    }

    return HttpResponse.json(newTask, { status: 201 })
  }),

  http.patch(`${API_BASE_URL}/tasks/:id`, async ({ params, request }) => {
    await delay(MOCK_DELAY)
    const body = (await request.json()) as Partial<Task>
    const task = mockTasks.find((t) => t.id === params.id)

    if (!task) {
      return HttpResponse.json({ message: "Không tìm thấy công việc" }, { status: 404 })
    }

    const updatedTask = { ...task, ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json(updatedTask)
  }),

  http.delete(`${API_BASE_URL}/tasks/:id`, async ({ params }) => {
    await delay(MOCK_DELAY)
    const task = mockTasks.find((t) => t.id === params.id)

    if (!task) {
      return HttpResponse.json({ message: "Không tìm thấy công việc" }, { status: 404 })
    }

    return HttpResponse.json({ message: "Xóa công việc thành công" })
  }),

  // ==================== NOTES ====================
  http.get(`${API_BASE_URL}/notes`, async () => {
    await delay(MOCK_DELAY)
    return HttpResponse.json(mockNotes)
  }),

  http.get(`${API_BASE_URL}/notes/:id`, async ({ params }) => {
    await delay(MOCK_DELAY)
    const note = mockNotes.find((n) => n.id === params.id)
    if (!note) {
      return HttpResponse.json({ message: "Không tìm thấy ghi chú" }, { status: 404 })
    }
    return HttpResponse.json(note)
  }),

  http.post(`${API_BASE_URL}/notes`, async ({ request }) => {
    await delay(MOCK_DELAY)
    const body = (await request.json()) as Partial<Note>

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: body.title || "New Note",
      content: body.content || "",
      tags: body.tags || [],
      isShared: body.isShared || false,
      sharedWith: body.sharedWith || [],
      createdBy: currentUser,
      projectId: body.projectId,
      isPinned: body.isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json(newNote, { status: 201 })
  }),

  http.patch(`${API_BASE_URL}/notes/:id`, async ({ params, request }) => {
    await delay(MOCK_DELAY)
    const body = (await request.json()) as Partial<Note>
    const note = mockNotes.find((n) => n.id === params.id)

    if (!note) {
      return HttpResponse.json({ message: "Không tìm thấy ghi chú" }, { status: 404 })
    }

    const updatedNote = { ...note, ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json(updatedNote)
  }),

  http.delete(`${API_BASE_URL}/notes/:id`, async ({ params }) => {
    await delay(MOCK_DELAY)
    return HttpResponse.json({ message: "Xóa ghi chú thành công" })
  }),

  // ==================== CHAT ====================
  // DISABLED: Use real API from backend instead of mock data
  // MSW handlers for chats are disabled to allow real database queries
  // All chat requests go to actual backend API at ${API_BASE_URL}

  // ==================== USERS ====================
  http.get(`${API_BASE_URL}/users`, async () => {
    await delay(MOCK_DELAY)
    return HttpResponse.json(mockUsers)
  }),

  http.get(`${API_BASE_URL}/users/:id`, async ({ params }) => {
    await delay(MOCK_DELAY)
    const user = mockUsers.find((u) => u.id === params.id)
    if (!user) {
      return HttpResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 })
    }
    return HttpResponse.json(user)
  }),

  http.patch(`${API_BASE_URL}/users/:id`, async ({ params, request }) => {
    await delay(MOCK_DELAY)
    const body = (await request.json()) as Partial<User>
    const user = mockUsers.find((u) => u.id === params.id)

    if (!user) {
      return HttpResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 })
    }

    const updatedUser = { ...user, ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json(updatedUser)
  }),

  // ==================== NOTIFICATIONS ====================
  http.get(`${API_BASE_URL}/notifications`, async () => {
    await delay(MOCK_DELAY)
    return HttpResponse.json([
      {
        id: "notif-1",
        title: "Công việc mới",
        message: "Nguyễn Văn An đã giao cho bạn một công việc mới",
        type: "info",
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        link: "/tasks/task-1",
      },
      {
        id: "notif-2",
        title: "Deadline sắp đến",
        message: "Công việc 'Tích hợp VNPay' sẽ đến hạn trong 2 ngày",
        type: "warning",
        read: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        link: "/tasks/task-3",
      },
      {
        id: "notif-3",
        title: "Đã hoàn thành",
        message: "Trần Thị Bình đã hoàn thành công việc 'Thiết kế giao diện'",
        type: "success",
        read: true,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        link: "/tasks/task-1",
      },
    ])
  }),

  http.post(`${API_BASE_URL}/notifications/:id/read`, async ({ params }) => {
    await delay(200)
    return HttpResponse.json({ message: "Đánh dấu đã đọc" })
  }),

  http.post(`${API_BASE_URL}/notifications/read-all`, async () => {
    await delay(200)
    return HttpResponse.json({ message: "Đánh dấu tất cả đã đọc" })
  }),

  // ==================== REPORTS ====================
  http.post(`${API_BASE_URL}/reports/export`, async ({ request }) => {
    await delay(1000)
    const body = (await request.json()) as any

    const jobId = `job-${Date.now()}`
    const downloadUrl = `/api/reports/download/${jobId}.${body.format}`

    return HttpResponse.json({
      jobId,
      downloadUrl,
    })
  }),

  http.get(`${API_BASE_URL}/reports/job/:jobId`, async ({ params }) => {
    await delay(500)
    return HttpResponse.json({
      status: "completed",
      downloadUrl: `/api/reports/download/${params.jobId}.pdf`,
    })
  }),

  // ==================== SEARCH ====================
  http.get(`${API_BASE_URL}/search`, async ({ request }) => {
    await delay(400)
    const url = new URL(request.url)
    const query = url.searchParams.get("q") || ""

    const lowerQuery = query.toLowerCase()

    const users = mockUsers.filter(
      (u) => u.name.toLowerCase().includes(lowerQuery) || u.email.toLowerCase().includes(lowerQuery),
    )

    const projects = mockProjects.filter(
      (p) => p.name.toLowerCase().includes(lowerQuery) || p.description.toLowerCase().includes(lowerQuery),
    )

    const tasks = mockTasks.filter(
      (t) => t.title.toLowerCase().includes(lowerQuery) || t.description.toLowerCase().includes(lowerQuery),
    )

    return HttpResponse.json({
      users: users.slice(0, 5),
      projects: projects.slice(0, 5),
      tasks: tasks.slice(0, 10),
    })
  }),
]
