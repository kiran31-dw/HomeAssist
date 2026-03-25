-- AI HomeAssist Schema Migration for Provider Approval

ALTER TABLE bookings 
ADD COLUMN rejection_reason TEXT,
ADD COLUMN admin_message TEXT;

-- We don't need to change the ENUM since 'pending' or 'cancelled' already exist.
-- But wait, let's verify if 'pending_payment' exists in the ENUM when bookings was created. The earlier migration added 'pending_payment' to the ENUM values.
