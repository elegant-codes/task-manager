-- ============================================
-- Task Manager - Supabase Schema + RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. CREATE TABLES

-- profiles extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- project_members
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'done', 'archived')),
  priority TEXT NOT NULL DEFAULT 'none' CHECK (priority IN ('none', 'low', 'medium', 'high', 'urgent')),
  position REAL NOT NULL DEFAULT 0,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 2. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);

-- 3. HELPER FUNCTIONS (security definer to bypass RLS recursion)
CREATE OR REPLACE FUNCTION public.is_project_member(project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = $1
    AND project_members.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_admin(project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_members.project_id = $1
    AND project_members.user_id = auth.uid()
    AND project_members.role = 'admin'
  );
$$;

-- 4. DROP EXISTING POLICIES (so re-run is safe)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Members can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project admin or creator can update" ON public.projects;
DROP POLICY IF EXISTS "Project admin or creator can delete" ON public.projects;
DROP POLICY IF EXISTS "Members can view project members" ON public.project_members;
DROP POLICY IF EXISTS "Users can view own membership" ON public.project_members;
DROP POLICY IF EXISTS "Project admin can add members" ON public.project_members;
DROP POLICY IF EXISTS "Project admin can remove members" ON public.project_members;
DROP POLICY IF EXISTS "Members can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Project admin or creator can delete tasks" ON public.tasks;

-- 5. RLS POLICIES

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Projects: members can view, creator can manage
CREATE POLICY "Members can view projects"
  ON public.projects FOR SELECT
  USING (
    public.is_project_member(id)
    OR created_by = auth.uid()
  );

CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project admin or creator can update"
  ON public.projects FOR UPDATE
  USING (
    created_by = auth.uid()
    OR public.is_project_admin(id)
  );

CREATE POLICY "Project admin or creator can delete"
  ON public.projects FOR DELETE
  USING (
    created_by = auth.uid()
    OR public.is_project_admin(id)
  );

-- Project members: members can view, admins can manage
CREATE POLICY "Members can view project members"
  ON public.project_members FOR SELECT
  USING (public.is_project_member(project_id));

CREATE POLICY "Users can view own membership"
  ON public.project_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Project admin can add members"
  ON public.project_members FOR INSERT
  WITH CHECK (
    public.is_project_admin(project_id)
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_id
      AND projects.created_by = auth.uid()
    )
  );

CREATE POLICY "Project admin can remove members"
  ON public.project_members FOR DELETE
  USING (
    public.is_project_admin(project_id)
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_id
      AND projects.created_by = auth.uid()
    )
  );

-- Tasks: members can CRUD, only admin can delete
CREATE POLICY "Members can view tasks"
  ON public.tasks FOR SELECT
  USING (public.is_project_member(project_id));

CREATE POLICY "Members can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND public.is_project_member(project_id)
  );

CREATE POLICY "Members can update tasks"
  ON public.tasks FOR UPDATE
  USING (public.is_project_member(project_id));

CREATE POLICY "Project admin or creator can delete tasks"
  ON public.tasks FOR DELETE
  USING (
    public.is_project_admin(project_id)
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = tasks.project_id
      AND projects.created_by = auth.uid()
    )
  );

-- 6. TRIGGER: auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
