# frontend-tasks

Web client for a task-management app, built with Next.js, React 19 and Tailwind CSS.

## Overview

`frontend-tasks` is the browser front end for a team task-management system. It covers authentication, projects, tasks (Kanban, list and calendar views), notes, team chat, notifications, reports and administration. Data comes from a separate REST API ([backend-tasks](https://github.com/nguyenngoctuyen11032003/backend-tasks)), with real-time updates over Socket.IO. The app can be installed as a PWA. The UI text is in Vietnamese.

## Key features

- **Authentication** (`src/app/(auth)`): login, registration, Google sign-in through the backend OAuth flow, email verification, forgot/reset password, and accepting team invitations. Route access is enforced client-side (`AuthWrapper`, `PermissionGuard`).
- **Dashboard** (`/dashboard`): stats cards and charts for task completion, project progress, team productivity, plus an activity timeline.
- **Projects** (`/projects`, `/projects/[id]`): create, edit and delete projects, manage members and tags.
- **Tasks** (`/tasks`): Kanban board with drag and drop, list and calendar views, task detail dialog, reminders, filters and sorting.
- **Notes** (`/notes`): rich-text editor (Tiptap) with images, links, @mentions and tags.
- **Chat** (`/chat`): real-time messaging with typing indicators, online presence and group info, plus a floating chat panel.
- **Team** (`/team`): invite members, manage roles, compose emails to members.
- **Reports** (`/reports`): report filters, charts and export to CSV, JSON, Excel or print.
- **Notifications**: notification bell and center, updated live via socket events.
- **Admin** (`/admin`): user, role and system management tabs.
- **Settings** (`/settings`): profile (with avatar upload and cropping), security and notification preferences.
- **Theming** (`/theme`): light/dark mode, theme presets and a custom theme editor with import/export.
- **Productivity and accessibility**: command palette (`cmdk`), global search, keyboard shortcuts panel, skip links, focus trapping and screen-reader announcements.
- **PWA**: service worker via `next-pwa` (network-first caching, disabled in development) and a web app manifest.

## Tech stack

| Area | Libraries |
| --- | --- |
| Framework | Next.js 16 (App Router, React Compiler), React 19, TypeScript |
| Styling / UI | Tailwind CSS 4, Radix UI primitives (shadcn/ui-style components), lucide-react, framer-motion, next-themes, sonner, vaul |
| State management | Zustand (client state), TanStack Query (server state) |
| Forms / validation | React Hook Form, Zod, @hookform/resolvers |
| Data / HTTP | Axios, Socket.IO client |
| Tables and charts | TanStack Table, Recharts |
| Editor | Tiptap (starter kit, image, link, mention, placeholder) |
| Drag and drop | dnd-kit |
| Files | react-dropzone, react-easy-crop, browser-image-compression |
| Dates | date-fns, react-day-picker |
| PWA | next-pwa |
| Monitoring | @vercel/analytics, web-vitals |
| Dev tooling | ESLint, MSW |

## Project structure

```
src/
  app/          App Router routes: (auth) pages, (main) app pages, layouts
  components/   Feature components (tasks, projects, chat, notes, reports, team, ...)
    ui/         Shared UI primitives
  hooks/        Data hooks (TanStack Query), socket sync hooks, UI/a11y hooks
  lib/          API client, socket client, query client, export, theme, utilities
  services/     API service modules per resource
  stores/       Zustand stores
  styles/       Global styles and design tokens
  types/        Shared TypeScript types
public/         PWA manifest, icons, service worker output
```

## Getting started

### Prerequisites

- Node.js (a version supported by Next.js 16)
- pnpm
- A running instance of [backend-tasks](https://github.com/nguyenngoctuyen11032003/backend-tasks)

### Install

```bash
pnpm install
```

### Environment variables

Create a `.env.local` file in the project root:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend REST API, including the `/api` prefix. Also used to proxy and allow images from `/uploads`. Defaults to `http://localhost:3001/api`. |
| `NEXT_PUBLIC_SOCKET_URL` | URL of the backend Socket.IO server for real-time features. Defaults to `http://localhost:3001`. |

### Run

```bash
pnpm dev
```

Then open http://localhost:3000.

## Scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `next dev` | Start the development server |
| `build` | `next build` | Build for production (generates the service worker) |
| `start` | `next start` | Serve the production build |
| `lint` | `eslint` | Run ESLint |

## Related repository

- [backend-tasks](https://github.com/nguyenngoctuyen11032003/backend-tasks): the API server this client depends on (REST endpoints, authentication, file uploads and Socket.IO events).

## Notes

- The PWA service worker is disabled when `NODE_ENV` is `development`; use `pnpm build && pnpm start` to test offline behavior.
- Requests to `/uploads/*` are rewritten to the backend origin derived from `NEXT_PUBLIC_API_URL`.
- `src/middleware.ts` is a deprecated pass-through; authentication is handled on the client.

## Author

Nguyễn Ngọc Tuyền ([@nguyenngoctuyen11032003](https://github.com/nguyenngoctuyen11032003))
