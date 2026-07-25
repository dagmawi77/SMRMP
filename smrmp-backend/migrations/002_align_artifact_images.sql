-- Run in Supabase SQL Editor if artifact_images already exists
-- from the older schema (created_at/updated_at/caption/sort_order)

ALTER TABLE artifact_images
  ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill uploaded_at from created_at when present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artifact_images' AND column_name = 'created_at'
  ) THEN
    UPDATE artifact_images
    SET uploaded_at = created_at
    WHERE uploaded_at IS NULL;
  END IF;
END $$;
