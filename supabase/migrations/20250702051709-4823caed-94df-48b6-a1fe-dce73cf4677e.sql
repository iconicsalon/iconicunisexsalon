
-- First, let's see what constraints actually exist on the bookings table
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.bookings'::regclass 
AND contype = 'c';

-- Drop ALL check constraints on the bookings table to be safe
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.bookings'::regclass 
        AND contype = 'c'
    LOOP
        EXECUTE 'ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS ' || constraint_record.conname;
    END LOOP;
END $$;

-- Now add the correct constraint with the right status values
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'accepted', 'cancelled', 'completed'));
