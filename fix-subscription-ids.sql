-- DYNAMIC FIX - Update all users based on their subscription_type
-- This script will automatically find the correct subscription_plan_id for each user

-- First, let's see the current state
SELECT '=== CURRENT STATE ===' as info;
SELECT id, username, email, subscription_type, subscription_plan_id, status 
FROM users 
ORDER BY id;

-- Now let's fix all users dynamically based on their subscription_type
-- This will work regardless of what IDs the subscription plans have

-- Fix users with 'lifetime' subscription_type
UPDATE users 
SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE plan_key = 'lifetime')
WHERE subscription_type = 'lifetime' AND subscription_plan_id IS NULL;

-- Fix users with 'free_trial' subscription_type
UPDATE users 
SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE plan_key = 'free_trial')
WHERE subscription_type = 'free_trial' AND subscription_plan_id IS NULL;

-- Fix users with '6_month' subscription_type
UPDATE users 
SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE plan_key = '6_month')
WHERE subscription_type = '6_month' AND subscription_plan_id IS NULL;

-- Fix users with '1_year' subscription_type
UPDATE users 
SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE plan_key = '1_year')
WHERE subscription_type = '1_year' AND subscription_plan_id IS NULL;

-- Fix users with '2_year' subscription_type
UPDATE users 
SET subscription_plan_id = (SELECT id FROM subscription_plans WHERE plan_key = '2_year')
WHERE subscription_type = '2_year' AND subscription_plan_id IS NULL;

-- Now verify the results
SELECT '=== AFTER FIX - ALL USERS ===' as info;
SELECT 
    u.id, 
    u.username, 
    u.email, 
    u.subscription_type, 
    u.subscription_plan_id,
    sp.name as plan_name,
    u.status 
FROM users u
LEFT JOIN subscription_plans sp ON u.subscription_plan_id = sp.id
ORDER BY u.id;

-- Check if any users still have NULL subscription_plan_id
SELECT '=== REMAINING NULL VALUES ===' as info;
SELECT id, username, email, subscription_type, subscription_plan_id, status 
FROM users 
WHERE subscription_plan_id IS NULL;

-- Show summary of what was updated
SELECT '=== UPDATE SUMMARY ===' as info;
SELECT 
    u.subscription_type,
    COUNT(*) as user_count,
    sp.name as plan_name,
    sp.id as plan_id
FROM users u
LEFT JOIN subscription_plans sp ON u.subscription_plan_id = sp.id
GROUP BY u.subscription_type, sp.name, sp.id
ORDER BY u.subscription_type;
