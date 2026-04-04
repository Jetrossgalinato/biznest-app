-- Function to check and consume an admin invite token
CREATE OR REPLACE FUNCTION consume_admin_invite(token_to_consume TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_id UUID;
BEGIN
  -- Find the invite
  SELECT id INTO invite_id
  FROM admin_invites
  WHERE token = token_to_consume AND used = false;

  IF invite_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Mark as used
  UPDATE admin_invites
  SET used = true, used_at = now()
  WHERE id = invite_id;

  RETURN TRUE;
END;
$$;
