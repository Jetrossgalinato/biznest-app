CREATE TABLE IF NOT EXISTS public.admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

-- Only allow superadmins to manage invites
CREATE POLICY "Allow superadmins to select invites" ON public.admin_invites FOR SELECT USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'superadmin');
CREATE POLICY "Allow superadmins to insert invites" ON public.admin_invites FOR INSERT WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'superadmin');
CREATE POLICY "Allow superadmins to update invites" ON public.admin_invites FOR UPDATE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'superadmin');
