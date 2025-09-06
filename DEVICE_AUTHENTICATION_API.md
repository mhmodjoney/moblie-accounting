# Device-Based Authentication API Documentation

## Overview
The authentication system now includes device-based security where each user can only log in from one device at a time. This prevents unauthorized access from different devices.

## How It Works

1. **Registration**: Users register normally, `device_id` is initially `null`
2. **First Login**: User provides `device_id` (like MAC address), it gets saved to their account
3. **Subsequent Logins**: Only the same `device_id` is allowed
4. **Device Change**: Admin can reset `device_id` to allow login from new device

## API Endpoints

### 1. User Registration
**POST** `/api/users/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "subscription_type": "free_trial",
  "role": "user"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user",
    "status": "new",
    "subscription_type": "free_trial",
    "subscription_plan_id": 1,
    "subscription_end": "2024-01-15T00:00:00.000Z"
  }
}
```

### 2. User Login (Updated)
**POST** `/api/users/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "device_id": "AA:BB:CC:DD:EE:FF"
}
```

**Response (First Login):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "status": "active",
    "role": "user",
    "subscription_type": "free_trial",
    "subscription_end": "2024-01-15T00:00:00.000Z",
    "device_id": "AA:BB:CC:DD:EE:FF"
  }
}
```

**Response (Different Device):**
```json
{
  "message": "Access denied. This account is already registered to another device. Please contact support if you need to change devices."
}
```

### 3. Admin: Reset User Device (New)
**POST** `/api/users/admin/reset-user-device`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "user_id": 1
}
```

**Response:**
```json
{
  "message": "User device ID reset successfully. User can now login from a new device.",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "device_id": null,
    "status": "new"
  }
}
```

### 4. Admin: Get All Users (Updated)
**GET** `/api/users/admin/users`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "All users retrieved successfully",
  "total_users": 2,
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "full_name": "John Doe",
      "email": "john@example.com",
      "status": "active",
      "role": "user",
      "subscription_type": "free_trial",
      "subscription_plan_id": 1,
      "subscription_end": "2024-01-15T00:00:00.000Z",
      "device_id": "AA:BB:CC:DD:EE:FF",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Error Responses

### Missing Device ID
```json
{
  "message": "Device ID is required for security purposes"
}
```

### Device Already Registered
```json
{
  "message": "Access denied. This account is already registered to another device. Please contact support if you need to change devices."
}
```

## Database Changes

### New Column Added
- `device_id` (VARCHAR(255), NULL, UNIQUE) - Stores unique device identifier

### Migration Script
Run `add-device-id-column.sql` to add the device_id column to existing databases.

## Security Features

1. **Device Binding**: Each user account is bound to one device
2. **First Login Activation**: User status changes from "new" to "active" on first login
3. **Admin Override**: Admins can reset device_id for legitimate device changes
4. **JWT Token**: Includes device_id for additional security validation

## Client Implementation

### Frontend Requirements
1. Generate unique device identifier (MAC address, device fingerprint, etc.)
2. Include `device_id` in all login requests
3. Handle device change scenarios gracefully
4. Provide user feedback for device-related errors

### Example Device ID Generation (JavaScript)
```javascript
// Simple device fingerprint (for demo purposes)
function generateDeviceId() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = canvas.toDataURL() + 
    navigator.userAgent + 
    navigator.language + 
    screen.width + 'x' + screen.height;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}
```

## Testing

### Test Scenarios
1. **New User Registration**: Verify device_id is null
2. **First Login**: Verify device_id gets saved and user becomes active
3. **Same Device Login**: Verify successful login
4. **Different Device Login**: Verify access denied
5. **Admin Device Reset**: Verify device_id becomes null and user can login from new device

### Sample Test Data
```json
{
  "test_user": {
    "email": "test@example.com",
    "password": "test123",
    "device_id": "TEST_DEVICE_001"
  }
}
```
