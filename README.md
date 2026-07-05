# Task Manager

A collaborative task management application with real-time sync, Kanban boards, and team collaboration. Built with Next.js, Supabase, and TypeScript.

**Live Demo → [task-manager-beta-three-39.vercel.app](https://task-manager-beta-three-39.vercel.app)**

## How to Use

1. **Sign up** at the live link using your email and a password (no confirmation needed for now).
2. **Create a project** using the sidebar button — you're automatically the admin.
3. **Invite teammates** by clicking the **Invite** button on any project page — enter their email (they must already have an account).
4. **Create tasks** with title, priority (optional), and assignee — they sync in real-time across all users.
5. **Drag tasks** between columns on the Kanban board, or use list view to filter by status/priority.
6. **Toggle dark/light mode** using the sun/moon icon in the sidebar.

> **Note:** Invited users see pending invitations on the **Invitations** page (linked in the sidebar) and can accept or decline.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth (email/password)
- **UI:** shadcn/ui + Tailwind CSS v4
- **State:** Supabase Realtime (live sync)
- **Drag & Drop:** @dnd-kit
- **Validation:** Zod
- **Deployment:** Vercel

## Features

- Email/password authentication
- Project management (create, list, switch)
- Task CRUD with status, priority, assignee
- Kanban board with drag-and-drop
- URL-based task filtering (status, priority)
- Real-time sync across users
- Invite members by email (accept/decline flow)
- Dark/light mode
- Responsive design (mobile + desktop)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (free)

### Setup

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a Supabase project at [supabase.com](https://supabase.com)
4. Copy your project URL and anon key from **Project Settings → API**
5. Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```
6. Run the schema in Supabase SQL Editor (see `supabase-schema.sql`)
7. Enable Realtime on the `tasks` and `project_members` tables:
   - Supabase Dashboard → Database → Replication → Enable replication for both tables
8. Start the dev server:
   ```bash
   npm run dev
   ```

### Default Auth Settings

- Email confirmation is disabled by default for demo purposes
- To enable: Supabase Dashboard → Authentication → Settings → Enable email confirmation

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login/signup pages
│   ├── projects/        # Project pages + invitations
│   └── auth/confirm/    # Email verification
├── components/
│   ├── projects/        # Project sidebar, mobile nav
│   ├── tasks/           # Task list, kanban board, filters
│   └── ui/              # shadcn/ui + custom components
├── hooks/               # Custom React hooks
├── lib/supabase/        # Supabase client utilities
└── actions/             # Server Actions
```

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SERVICE_ROLE_KEY`)
4. Deploy
