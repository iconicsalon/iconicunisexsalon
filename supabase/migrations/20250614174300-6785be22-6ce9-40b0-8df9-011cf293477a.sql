
-- Add amount_paid column to store actual amount paid by customer
ALTER TABLE bookings ADD COLUMN amount_paid numeric;

-- Improve status column with constraint to ensure only valid values
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS status_check;
ALTER TABLE bookings ADD CONSTRAINT status_check CHECK (status IN ('pending', 'done'));

-- Set default amount_paid to total_amount for existing bookings
UPDATE bookings SET amount_paid = total_amount WHERE amount_paid IS NULL;
