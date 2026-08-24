-- ============================================================================
-- Migration: Enforce Storage Security (CVs)
-- Version:   20260824000000
-- ============================================================================

-- 1. Ensure the bucket is strictly private
UPDATE storage.buckets
SET public = false
WHERE id = 'candidate_documents';

-- 2. Drop any existing permissive policies
DROP POLICY IF EXISTS "Public access to candidate_documents" ON storage.objects;
DROP POLICY IF EXISTS "Recruiter access to candidate_documents" ON storage.objects;

-- 3. Policy: Service Role can do anything (used by AI service to download CVs)
CREATE POLICY "Service Role CV Access" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'candidate_documents')
  WITH CHECK (bucket_id = 'candidate_documents');

-- 4. Policy: Recruiters can only access documents belonging to their organization
-- The path structure is: org_id/application_id/candidate_id/filename
-- We extract the org_id from the first segment of the storage path.
CREATE POLICY "Recruiter CV Access" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'candidate_documents' AND
    public.is_org_member( (string_to_array(name, '/'))[1]::uuid )
  );
