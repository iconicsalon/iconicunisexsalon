
-- Add time_slot column to the bookings table
ALTER TABLE public.bookings 
ADD COLUMN time_slot TEXT;

-- Update the column to be NOT NULL with a default value for existing records
UPDATE public.bookings 
SET time_slot = '9:00 AM - 11:00 AM' 
WHERE time_slot IS NULL;

-- Make the column NOT NULL
ALTER TABLE public.bookings 
ALTER COLUMN time_slot SET NOT NULL;
