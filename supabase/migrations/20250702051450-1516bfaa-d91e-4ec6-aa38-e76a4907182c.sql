
-- Check the current constraint on the bookings table
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.bookings'::regclass 
AND contype = 'c';

-- Drop the existing status check constraint if it exists
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add a new check constraint that allows the correct status values
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'accepted', 'cancelled', 'completed'));
