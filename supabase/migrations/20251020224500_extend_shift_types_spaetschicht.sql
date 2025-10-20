-- Extend allowed shift_type values to include 'Spätschicht' (Late shift).
-- Existing rows remain unchanged.

DO $$
BEGIN
  -- Drop existing check if present
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'jobs_shift_type_check'
      AND table_name = 'jobs'
  ) THEN
    ALTER TABLE jobs DROP CONSTRAINT jobs_shift_type_check;
  END IF;

  -- Add updated check constraint
  ALTER TABLE jobs
    ADD CONSTRAINT jobs_shift_type_check
    CHECK (shift_type IS NULL OR shift_type IN ('Tagschicht', 'Spätschicht', 'Nachtschicht'));
END $$;