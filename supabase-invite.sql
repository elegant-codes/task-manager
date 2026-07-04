-- Run this in Supabase SQL Editor
-- Creates an RPC function to find a user by email and add them to a project

CREATE OR REPLACE FUNCTION public.add_project_member_by_email(
  p_project_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'member'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_user_name TEXT;
BEGIN
  -- Find the user by email in auth.users
  SELECT id, raw_user_meta_data ->> 'name'
  INTO v_user_id, v_user_name
  FROM auth.users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User with this email not found');
  END IF;

  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_project_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is already a member');
  END IF;

  -- Add to project
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (p_project_id, v_user_id, p_role);

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'name', COALESCE(v_user_name, split_part(p_email, '@', 1))
  );
END;
$$;
