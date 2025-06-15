
-- First, let's see what constraints exist on the bookings table
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.bookings'::regclass 
AND contype = 'c';

-- Drop all existing status check constraints
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS status_check;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add the correct constraint with proper name and values
ALTER TABLE public.bookings ADD CONSTRAINT status_check 
CHECK (status IN ('pending', 'accept', 'cancel', 'cancelled', 'completed', 'confirmed'));
