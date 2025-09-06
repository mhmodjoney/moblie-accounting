# Mobile Accounting API Testing Guide

## 🚀 **Overview**
This guide covers testing all API endpoints for the Mobile Accounting subscription management system. The system now uses **dynamic database-driven subscription plans** instead of hardcoded values.

## 🔧 **Setup**

### **Environment Variables**
Set these in your Postman environment:
- `base_url`: `http://localhost:8080`
- `auth_token`: User authentication token (obtained after login)
- `admin_token`: Admin authentication token (obtained after admin login)

### **Database Requirements**
Before testing, ensure your database has:
1. **Subscription Plans** populated (run `populate-subscription-plans.sql`)
2. **Existing users** with proper `subscription_plan_id` (run `fix-subscription-ids.sql`)

## 📋 **API Endpoints**

### **1. Authentication**

#### **Register User**
```http
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "full_name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "subscription_type": "free_trial"
}
```
**Features:**
- ✅ **Automatically validates** subscription type against database
- ✅ **Automatically sets** `subscription_plan_id` foreign key
- ✅ **Calculates dates** based on database values
- ✅ **No hardcoded logic!**

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "Test User",
    "status": "new",
    "subscription_type": "free_trial",
    "subscription_plan_id": 1,
    "subscription_end": "2025-01-24T10:00:00.000Z"
  }
}
```

#### **Login User**
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "Test User",
    "status": "new",
    "subscription_type": "free_trial",
    "subscription_end": "2025-01-24T10:00:00.000Z"
  }
}
```

### **2. User Management**

#### **Check Subscription Status**
```http
GET {{base_url}}/api/auth/subscription
Authorization: Bearer {{auth_token}}
```

#### **Upgrade Subscription**
```http
POST {{base_url}}/api/auth/upgrade-subscription
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "subscription_type": "6_month"
}
```
**Features:**
- ✅ **Validates plan** exists in database
- ✅ **Automatically sets** `subscription_plan_id`
- ✅ **Calculates new end date** from database

### **3. Subscription Plans (NEW!)**

#### **Get All Plans (Public)**
```http
GET {{base_url}}/api/subscriptions/plans
```
**Features:**
- ✅ **No authentication required**
- ✅ **Returns all active plans** from database
- ✅ **Dynamic pricing and features**

**Response:**
```json
{
  "message": "Subscription plans retrieved successfully",
  "plans": [
    {
      "id": 1,
      "plan_key": "free_trial",
      "name": "Free Trial",
      "price": 0.00,
      "currency": "USD",
      "duration_days": 7,
      "description": "7-day free trial",
      "features": ["Basic access", "Limited features"],
      "max_users": 1,
      "is_active": true
    },
    {
      "id": 2,
      "plan_key": "6_month",
      "name": "Semi-Annual Plan",
      "price": 44.99,
      "currency": "USD",
      "duration_days": 180,
      "description": "6 months subscription",
      "features": ["Full access", "All features", "Priority support", "10% discount"],
      "max_users": 1,
      "is_active": true
    }
  ]
}
```

#### **Create Subscription**
```http
POST {{base_url}}/api/subscriptions/create
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "user_id": 1,
  "subscription_type": "6_month",
  "payment_id": "pay_123456",
  "payment_method": "credit_card",
  "auto_renew": true
}
```

#### **Get User Subscription**
```http
GET {{base_url}}/api/subscriptions/user
Authorization: Bearer {{auth_token}}
```

### **4. Admin Management**

#### **Get All Users**
```http
GET {{base_url}}/api/auth/admin/users
Authorization: Bearer {{admin_token}}
```
**Features:**
- ✅ **Includes subscription plan details** via JOIN
- ✅ **Shows `subscription_plan_id`** and plan names
- ✅ **Complete user information**

**Response:**
```json
{
  "message": "All users retrieved successfully",
  "total_users": 17,
  "users": [
    {
      "id": 20,
      "username": "admin",
      "email": "admin@mobileaccounting.com",
      "full_name": "System Administrator",
      "status": "active",
      "role": "admin",
      "subscription_type": "lifetime",
      "subscription_plan_id": 5,
      "subscription_end": "2125-07-24T10:38:53.238Z",
      "plan": {
        "id": 5,
        "plan_key": "lifetime",
        "name": "Lifetime Access",
        "price": 299.99,
        "duration_days": 36500
      }
    }
  ]
}
```

#### **Upgrade User Subscription**
```http
POST {{base_url}}/api/auth/admin/upgrade-user
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "user_id": 2,
  "subscription_type": "1_year"
}
```

#### **Update User Status**
```http
POST {{base_url}}/api/auth/admin/update-user-status
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "user_id": 2,
  "status": "active"
}
```

### **5. File Upload**

#### **Upload Image**
```http
POST {{base_url}}/api/upload/upload-image
Authorization: Bearer {{auth_token}}
Content-Type: multipart/form-data

Form Data:
- image: [select file]
```

## 🧪 **Testing Scenarios**

### **Scenario 1: New User Registration**
1. **Register** with `subscription_type: "free_trial"`
2. **Verify** `subscription_plan_id` is automatically set
3. **Check** subscription end date is calculated from database
4. **Login** and verify token

### **Scenario 2: Subscription Upgrade**
1. **Login** as existing user
2. **Upgrade** to `6_month` plan
3. **Verify** `subscription_plan_id` is updated
4. **Check** new end date is calculated

### **Scenario 3: Admin Operations**
1. **Login** as admin user
2. **Get all users** - verify plan details are included
3. **Upgrade user** subscription
4. **Update user** status

### **Scenario 4: Dynamic Plan Management**
1. **Get all plans** (public endpoint)
2. **Verify** plans come from database
3. **Test** with different subscription types
4. **Confirm** no hardcoded values

## 🔍 **Key Changes Made**

### **✅ Removed Hardcoded Values**
- ❌ No more `subscriptionDurations` object
- ❌ No more hardcoded plan configurations
- ❌ No more static validation arrays

### **✅ Database-Driven System**
- ✅ **Dynamic plan validation** against database
- ✅ **Automatic foreign key** setting (`subscription_plan_id`)
- ✅ **Dynamic date calculations** from database values
- ✅ **Real-time plan information** from database

### **✅ Enhanced Responses**
- ✅ **Includes `subscription_plan_id`** in all user responses
- ✅ **Plan details** via JOIN queries
- ✅ **Complete subscription information**

## 🚨 **Common Issues & Solutions**

### **Issue: "Invalid subscription type"**
**Cause:** Plan doesn't exist in database
**Solution:** Run `populate-subscription-plans.sql` first

### **Issue: `subscription_plan_id` is NULL**
**Cause:** Existing users weren't updated
**Solution:** Run `fix-subscription-ids.sql` to fix existing users

### **Issue: "Cannot read property 'duration_days'"**
**Cause:** Database query failed
**Solution:** Check database connection and table structure

## 📊 **Database Verification**

After running the scripts, verify:
```sql
-- Check subscription plans exist
SELECT * FROM subscription_plans;

-- Check users have proper foreign keys
SELECT 
    u.username, 
    u.subscription_type, 
    u.subscription_plan_id,
    sp.name as plan_name
FROM users u
LEFT JOIN subscription_plans sp ON u.subscription_plan_id = sp.id
WHERE u.subscription_plan_id IS NOT NULL;
```

## 🎯 **Success Criteria**

✅ **All users** have valid `subscription_plan_id` values  
✅ **New registrations** automatically set foreign keys  
✅ **Subscription upgrades** update both type and ID  
✅ **Admin queries** include complete plan information  
✅ **No hardcoded** subscription logic anywhere  
✅ **All calculations** use database values  

---

**🎉 Your system is now completely dynamic and database-driven!**
