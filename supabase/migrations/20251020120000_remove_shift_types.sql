-- Restrict to allowed values and clean up removed ones.
-- 1) Null out removed values (Wechselschicht, Bereitschaftsdienst).
UPDATE jobs
SET shift_type = NULL
WHERE shift_type IN ('Wechselschicht', 'Bereitschaftsdienst');

-- 2) Add check constraint to allow only Tagschicht/Nachtschicht or NULL.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'jobs_shift_type_check'
      AND table_name = 'jobs'
  ) THEN
    ALTER TABLE jobs
      ADD CONSTRAINT jobs_shift_type_check
      CHECK (shift_type IS NULL OR shift_type IN ('Tagschicht', 'Nachtschicht'));
  END IF;
END $$;

-- Note: Existing postings with only removed values now have NULL shift_type.
-- They render without a shift chip and can be edited later to select Day/Night.