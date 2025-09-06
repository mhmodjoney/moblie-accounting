# Subscription Plan API Documentation

This document describes the complete CRUD API for managing subscription plans in the Mobile Accounting system.

## Base URL
```
http://localhost:8080/api/subscription-plans
```

## Authentication
- **Public endpoints**: No authentication required
- **Admin endpoints**: Require JWT token and admin role

## Endpoints

### 1. Get All Subscription Plans (Public)
**GET** `/api/subscription-plans`

Returns all subscription plans (both active and inactive).

**Response:**
```json
{
  "message": "Subscription plans retrieved successfully",
  "total_plans": 3,
  "plans": [
    {
      "id": 1,
      "plan_key": "basic",
      "name": "Basic Plan",
      "price": "9.99",
      "currency": "USD",
      "duration_days": 30,
      "description": "Basic features for small businesses",
      "features": ["basic_reports", "up_to_5_users"],
      "max_users": 5,
      "is_active": true,
      "created_by": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Active Subscription Plans (Public)
**GET** `/api/subscription-plans/active`

Returns only active subscription plans.

**Response:**
```json
{
  "message": "Active subscription plans retrieved successfully",
  "total_plans": 2,
  "plans": [...]
}
```

### 3. Get Subscription Plan by ID (Public)
**GET** `/api/subscription-plans/:id`

Returns a specific subscription plan by its ID.

**Parameters:**
- `id` (path): Subscription plan ID

**Response:**
```json
{
  "message": "Subscription plan retrieved successfully",
  "plan": {
    "id": 1,
    "plan_key": "basic",
    "name": "Basic Plan",
    "price": "9.99",
    "currency": "USD",
    "duration_days": 30,
    "description": "Basic features for small businesses",
    "features": ["basic_reports", "up_to_5_users"],
    "max_users": 5,
    "is_active": true,
    "created_by": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Create Subscription Plan (Admin Only)
**POST** `/api/subscription-plans`

Creates a new subscription plan.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "plan_key": "premium",
  "name": "Premium Plan",
  "price": 29.99,
  "currency": "USD",
  "duration_days": 30,
  "description": "Premium features for growing businesses",
  "features": ["advanced_reports", "unlimited_users", "priority_support"],
  "max_users": 100,
  "is_active": true
}
```

**Required Fields:**
- `plan_key`: Unique identifier for the plan
- `name`: Display name of the plan
- `price`: Plan price
- `duration_days`: Duration in days

**Optional Fields:**
- `currency`: Currency code (default: "USD")
- `description`: Plan description
- `features`: JSON array of features
- `max_users`: Maximum number of users (default: 1)
- `is_active`: Whether plan is active (default: true)

**Response:**
```json
{
  "message": "Subscription plan created successfully",
  "plan": {
    "id": 2,
    "plan_key": "premium",
    "name": "Premium Plan",
    "price": "29.99",
    "currency": "USD",
    "duration_days": 30,
    "description": "Premium features for growing businesses",
    "features": ["advanced_reports", "unlimited_users", "priority_support"],
    "max_users": 100,
    "is_active": true,
    "created_by": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Update Subscription Plan (Admin Only)
**PUT** `/api/subscription-plans/:id`

Updates an existing subscription plan.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Parameters:**
- `id` (path): Subscription plan ID

**Request Body:**
```json
{
  "name": "Updated Premium Plan",
  "price": 39.99,
  "description": "Updated description with new features"
}
```

**Response:**
```json
{
  "message": "Subscription plan updated successfully",
  "plan": {
    "id": 2,
    "plan_key": "premium",
    "name": "Updated Premium Plan",
    "price": "39.99",
    "currency": "USD",
    "duration_days": 30,
    "description": "Updated description with new features",
    "features": ["advanced_reports", "unlimited_users", "priority_support"],
    "max_users": 100,
    "is_active": true,
    "updated_by": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. Delete Subscription Plan (Admin Only)
**DELETE** `/api/subscription-plans/:id`

Permanently deletes a subscription plan. **Note**: Can only delete plans that are not being used by any users or active subscriptions.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Parameters:**
- `id` (path): Subscription plan ID

**Response:**
```json
{
  "message": "Subscription plan deleted successfully",
  "deleted_plan": {
    "id": 3,
    "plan_key": "trial",
    "name": "Trial Plan"
  }
}
```

**Error Response (if plan is in use):**
```json
{
  "message": "Cannot delete plan. 5 user(s) are currently subscribed to this plan.",
  "user_count": 5
}
```

### 7. Deactivate Subscription Plan (Admin Only)
**PATCH** `/api/subscription-plans/:id/deactivate`

Soft deletes a subscription plan by setting `is_active` to false.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Parameters:**
- `id` (path): Subscription plan ID

**Response:**
```json
{
  "message": "Subscription plan deactivated successfully",
  "plan": {
    "id": 2,
    "plan_key": "premium",
    "name": "Premium Plan",
    "is_active": false
  }
}
```

### 8. Reactivate Subscription Plan (Admin Only)
**PATCH** `/api/subscription-plans/:id/reactivate`

Reactivates a deactivated subscription plan by setting `is_active` to true.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Parameters:**
- `id` (path): Subscription plan ID

**Response:**
```json
{
  "message": "Subscription plan reactivated successfully",
  "plan": {
    "id": 2,
    "plan_key": "premium",
    "name": "Premium Plan",
    "is_active": true
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Plan key, name, price, and duration days are required"
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided!"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "message": "Subscription plan not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Data Model

### Subscription Plan Fields
- `id`: Primary key (auto-increment)
- `plan_key`: Unique identifier (required)
- `name`: Display name (required)
- `price`: Plan price (required)
- `currency`: Currency code (default: "USD")
- `duration_days`: Duration in days (required)
- `description`: Plan description
- `features`: JSON array of features
- `max_users`: Maximum number of users (default: 1)
- `is_active`: Whether plan is active (default: true)
- `created_by`: User who created the plan
- `updated_by`: User who last updated the plan
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Usage Examples

### Creating a Basic Plan
```bash
curl -X POST http://localhost:8080/api/subscription-plans \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_key": "basic",
    "name": "Basic Plan",
    "price": 9.99,
    "duration_days": 30,
    "description": "Basic features for small businesses",
    "features": ["basic_reports", "up_to_5_users"],
    "max_users": 5
  }'
```

### Updating a Plan
```bash
curl -X PUT http://localhost:8080/api/subscription-plans/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 14.99,
    "description": "Updated basic plan with more features"
  }'
```

### Deactivating a Plan
```bash
curl -X PATCH http://localhost:8080/api/subscription-plans/1/deactivate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Notes

1. **Admin Only Operations**: Create, update, delete, activate, and deactivate operations require admin privileges
2. **JWT Authentication**: All admin operations require a valid JWT token
3. **Role-Based Access**: Only users with `role: "admin"` can perform administrative operations
4. **Data Validation**: All input data is validated before processing
5. **Safe Deletion**: Plans cannot be deleted if they are currently in use by users or subscriptions
