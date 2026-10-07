-- ============================================================================
-- spotlightU FIX: is_admin() privilege escalation
-- Bug: the previous is_admin() ran SECURITY DEFINER, so current_user resolved
--      to the function owner (postgres), which IS a member of the `admin`
--      role -> is_admin() returned true for EVERY caller (anon + any user),
--      exposing all applications and allowing arbitrary updates.
-- Fix: derive admin strictly from the caller's own JWT app_metadata claim.
--      No role-membership check, no SECURITY DEFINER. Exposes nothing beyond
--      the caller's own claim, so RPC exposure is harmless.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    ((auth.jwt() -> 'app_metadata') ->> 'admin')::boolean,
    false
  );
$$;

-- Drop the previous permissive implementation's grants surface is unchanged,
-- but ensure only the intended roles can invoke it.
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Re-affirm policies use the corrected function (no change needed to the
-- policy definitions themselves; they reference public.is_admin() live).