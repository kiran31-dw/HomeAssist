-- Add payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  user_id INT NOT NULL,
  provider_id INT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2) NOT NULL,
  provider_earning DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  card_last4 VARCHAR(4),
  card_type VARCHAR(20),
  transaction_id VARCHAR(100) UNIQUE,
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (provider_id) REFERENCES service_providers(provider_id)
);

-- Add admin_revenue table
CREATE TABLE IF NOT EXISTS admin_revenue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  source VARCHAR(100) DEFAULT 'booking_commission',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Note: The column name in the original `bookings` table is `booking_id`, not `id`.

-- Also add a column to the bookings table:
ALTER TABLE bookings ADD COLUMN payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid';
ALTER TABLE bookings ADD COLUMN payment_id INT NULL;

-- Also update status enum in bookings to include pending_payment
ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'pending_payment') DEFAULT 'pending';
