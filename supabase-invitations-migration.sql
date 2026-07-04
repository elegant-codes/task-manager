-- Run this in Supabase SQL Editor
-- Adds accept/decline invitation flow

-- 1. Add status column to project_members
ALTER TABLE public.project_members
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'pending', 'declined'));

-- 2. Update helper functions to only count active members
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
    AND project_members.status = 'active'
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
    AND project_members.status = 'active'
  );
$$;

-- 3. Add UPDATE policy for members to accept/decline their own invitations
DROP POLICY IF EXISTS "Users can update own membership" ON public.project_members;
CREATE POLICY "Users can update own membership"
  ON public.project_members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status IN ('active', 'declined'));
