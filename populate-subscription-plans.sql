-- Populate subscription_plans table with the exact data from your database
-- This matches the data shown in your DBeaver screenshot

INSERT INTO subscription_plans (plan_key, name, price, currency, duration_days, description, features, max_users, is_active, created_by, created_at, updated_at)
VALUES 
  ('free_trial', 'Free Trial', 0.00, 'USD', 7, '7-day free trial', '["Basic access", "Limited features"]', 1, true, 'system', NOW(), NOW()),
  ('6_month', 'Semi-Annual Plan', 44.99, 'USD', 180, '6 months subscription', '["Full access", "All features", "Priority support", "10% discount"]', 1, true, 'system', NOW(), NOW()),
  ('1_year', 'Annual Plan', 79.99, 'USD', 365, '1 year subscription', '["Full access", "All features", "Priority support", "20% discount"]', 1, true, 'system', NOW(), NOW()),
  ('2_year', 'Biennial Plan', 139.99, 'USD', 730, '2 years subscription', '["Full access", "All features", "Priority support", "30% discount"]', 1, true, 'system', NOW(), NOW()),
  ('lifetime', 'Lifetime Access', 299.99, 'USD', 36500, 'Lifetime subscription', '["Full access", "All features", "Lifetime updates", "Premium support"]', 5, true, 'system', NOW(), NOW())
ON CONFLICT (plan_key) DO NOTHING;

-- Verify the data
SELECT '=== SUBSCRIPTION PLANS ===' as info;
SELECT * FROM subscription_plans ORDER BY id;
