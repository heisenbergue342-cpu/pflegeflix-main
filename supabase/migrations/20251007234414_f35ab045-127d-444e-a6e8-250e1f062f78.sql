-- Add foreign key constraint for application_messages sender_id to profiles
-- First check if constraint exists and drop if needed
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'application_messages_sender_id_fkey' 
        AND table_name = 'application_messages'
    ) THEN
        ALTER TABLE public.application_messages 
        DROP CONSTRAINT application_messages_sender_id_fkey;
    END IF;
END $$;

-- Add the foreign key constraint
ALTER TABLE public.application_messages
ADD CONSTRAINT application_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;