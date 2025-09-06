-- Add device_id column to users table
-- This script adds the device_id column to the existing users table

-- Add the device_id column
ALTER TABLE users ADD COLUMN device_id VARCHAR(255) NULL UNIQUE;

-- Add an index for better performance on device_id lookups
CREATE INDEX idx_users_device_id ON users(device_id);

-- Optional: Add a comment to document the column purpose
ALTER TABLE users MODIFY COLUMN device_id VARCHAR(255) NULL UNIQUE COMMENT 'Unique device identifier for device-based authentication';
