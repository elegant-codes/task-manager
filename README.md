# Task Manager

A collaborative task management application built with Next.js, Supabase, and TypeScript.

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
7. Enable Realtime on the `tasks` table:
   - Supabase Dashboard → Database → Replication → Enable replication for `tasks`
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
│   ├── projects/        # Project pages
│   └── auth/confirm/    # Email verification
├── components/
│   ├── projects/        # Project sidebar, mobile nav
│   ├── tasks/           # Task list, kanban board, filters
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/supabase/        # Supabase client utilities
└── actions/             # Server Actions
```

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables
4. Deploy
