-- ============================================================================
-- spotlightU Migration: Applicant applications + admin access
-- Description: model_applications table (form submissions), RLS admin-only,
--              storage bucket for headshots, admin claim helper.
-- ============================================================================

-- 1. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.model_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 16),
  height TEXT NOT NULL,
  location TEXT NOT NULL,
  instagram TEXT,
  about TEXT,
  headshot_url TEXT,
  fullbody_url TEXT,
  profile_url TEXT,
  additional_urls TEXT[] NOT NULL DEFAULT '{}'::text[],
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewing','accepted','declined')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_model_applications_status ON public.model_applications(status);
CREATE INDEX IF NOT EXISTS idx_model_applications_created ON public.model_applications(created_at DESC);

ALTER TABLE public.model_applications ENABLE ROW LEVEL SECURITY;

-- Public: anyone can INSERT an application (the form)
CREATE POLICY "Anyone can submit an application"
  ON public.model_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins: full access via admin claim
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM pg_catalog.pg_auth_members m
      JOIN pg_catalog.pg_roles r ON r.oid = m.roleid
      JOIN pg_catalog.pg_roles u ON u.oid = m.member
      WHERE u.rolname = current_user
        AND r.rolname = 'admin'
    )
    OR current_setting('request.jwt.claim_role', true) = 'admin'
    OR (
      current_setting('request.jwt.claims', true) IS NOT NULL
      AND (current_setting('request.jwt.claims', true)::jsonb ->> 'admin')::boolean IS TRUE
    );
$$;

CREATE POLICY "Admins can view applications"
  ON public.model_applications
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update applications"
  ON public.model_applications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete applications"
  ON public.model_applications
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- No UPDATE/DELETE policy for anon: public can only insert.

-- 2. updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_model_applications_updated ON public.model_applications;
CREATE TRIGGER on_model_applications_updated
  BEFORE UPDATE ON public.model_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. STORAGE BUCKET: applicant-photos (private, admin reads, public submits)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'applicant-photos',
  'applicant-photos',
  false,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif'];

-- Public (anon) may upload into applications/ folder
CREATE POLICY "Anyone can upload applicant photos"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'applicant-photos'
    AND (storage.foldername(name))[1] = 'applications'
  );

-- Admins may read all applicant photos
CREATE POLICY "Admins can view applicant photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'applicant-photos'
    AND public.is_admin()
  );

-- 4. ADMIN ROLE + auto-confirm users (same pattern as spotlog)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin NOLOGIN;
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, pg_catalog.timezone('utc'::text, pg_catalog.now()));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_auto_confirm_user ON auth.users;
CREATE TRIGGER tr_auto_confirm_user
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();
