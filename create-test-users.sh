#!/bin/bash

# Test User Creation Script for Mobile Accounting API
# This script creates multiple test users with different roles and subscription types

BASE_URL="http://localhost:8080"
API_ENDPOINT="$BASE_URL/api/auth/register"

echo "🚀 Starting user creation process..."
echo "📡 Server URL: $BASE_URL"
echo ""

# Function to register a user
register_user() {
    local username=$1
    local full_name=$2
    local email=$3
    local password=$4
    local subscription_type=$5
    local role=$6
    
    echo "🔄 Registering user: $username ($email)"
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{
            \"username\": \"$username\",
            \"full_name\": \"$full_name\",
            \"email\": \"$email\",
            \"password\": \"$password\",
            \"subscription_type\": \"$subscription_type\",
            \"role\": \"$role\"
        }")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 201 ]; then
        echo "✅ Success: $username registered successfully"
        echo "   - Response: $body"
    else
        echo "❌ Error registering $username (HTTP $http_code)"
        echo "   - Response: $body"
    fi
    echo ""
}

# Function to test login
test_login() {
    local email=$1
    local password=$2
    local device_id=$3
    
    echo "🔐 Testing login for: $email"
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\",
            \"device_id\": \"$device_id\"
        }")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ Login successful for $email"
        echo "   - Device ID saved: $device_id"
    else
        echo "❌ Login failed for $email (HTTP $http_code)"
        echo "   - Response: $body"
    fi
    echo ""
}

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s "$BASE_URL" > /dev/null; then
    echo "❌ Server is not running on $BASE_URL"
    echo "   Please start the server with: node server.js"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Create test users
echo "📋 Creating test users..."

# User 1: Free trial user
register_user "john_doe" "John Doe" "john.doe@example.com" "password123" "free_trial" "user"

# User 2: 1 month subscription
register_user "jane_smith" "Jane Smith" "jane.smith@example.com" "password123" "1_month" "user"

# User 3: 3 month subscription
register_user "bob_wilson" "Bob Wilson" "bob.wilson@example.com" "password123" "3_month" "user"

# User 4: 6 month subscription
register_user "alice_brown" "Alice Brown" "alice.brown@example.com" "password123" "6_month" "user"

# User 5: Admin user
register_user "admin_user" "Admin User" "admin@admin.com" "admin123456" "lifetime" "admin"

# User 6: Test user for device testing
register_user "test_user" "Test User" "test@example.com" "test123" "free_trial" "user"

echo "🎉 User creation completed!"
echo ""

# Test logins
echo "🔐 Testing logins with device IDs..."

test_login "john.doe@example.com" "password123" "DEVICE_JOHN_001"
test_login "jane.smith@example.com" "password123" "DEVICE_JANE_001"
test_login "bob.wilson@example.com" "password123" "DEVICE_BOB_001"
test_login "alice.brown@example.com" "password123" "DEVICE_ALICE_001"
test_login "admin@admin.com" "admin123456" "DEVICE_ADMIN_001"
test_login "test@example.com" "test123" "DEVICE_TEST_001"

echo "📝 Next steps:"
echo "1. Use the Postman collection to test API endpoints"
echo "2. Try logging in with different device IDs to test device security"
echo "3. Use admin credentials to manage users"
echo "4. Test the device reset functionality"
