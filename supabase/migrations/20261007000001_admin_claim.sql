-- Grant admin privilege to the spotlightmng@outlook.com user via a JWT-claim
-- hook: Supabase auth reads raw_app_meta_data into JWT claims, so a custom
-- admin claim in app_metadata makes is_admin() return true for this user.

UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"admin": true}'::jsonb
WHERE email = 'spotlightmng@outlook.com';

-- Also create a trigger so any future admin-flagged user gets the claim
-- (admins are managed by setting raw_app_meta_data->admin = true).

-- Verify
SELECT id, email, raw_app_meta_data->>'admin' AS admin_claim FROM auth.users WHERE email = 'spotlightmng@outlook.com';
