# Mobile Accounting API

A secure Node.js API for mobile accounting with device-based authentication, subscription management, and file upload capabilities.

## 🚀 Features

- **Device-Based Authentication**: Users bound to single device for enhanced security
- **Subscription Management**: Multiple subscription plans with automatic expiration
- **User Management**: Registration, login, and admin controls
- **File Upload**: Cloudinary integration for image uploads
- **JWT Security**: Secure token-based authentication
- **Admin Panel**: Complete user and subscription management

## 🛠️ Tech Stack

- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Sequelize** - MySQL ORM
- **JWT** - Authentication tokens
- **Cloudinary** - File upload service
- **bcrypt** - Password hashing

## 📁 Project Structure

```
app/
├── config/             # Database configuration
│   └── db.config.js   # MySQL connection settings
├── controllers/        # Request handlers
│   ├── user.controller.js      # User authentication & management
│   ├── subscription.controller.js # Subscription management
│   ├── subscription.plan.controller.js # Plan management
│   └── upload.controller.js   # File upload handling
├── middleware/         # Custom middleware
│   ├── auth.middleware.js     # JWT authentication
│   └── admin.middleware.js    # Admin role validation
├── models/             # Database models
│   ├── user.model.js          # User schema
│   ├── subscription.model.js  # Subscription schema
│   └── subscription.plan.model.js # Plan schema
├── routes/             # API routes
│   ├── user.routes.js         # User endpoints
│   ├── subscription.routes.js # Subscription endpoints
│   └── subscription.plan.routes.js # Plan endpoints
└── models/index.js    # Sequelize initialization
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL database
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd moblie-accounting
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your actual values:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=mobile_accounting
   DB_USER=your_username
   DB_PASS=your_password
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Set up the database:**
   ```bash
   # Run the migration script
   mysql -u your_username -p mobile_accounting < add-device-id-column.sql
   
   # Create subscription plans
   mysql -u your_username -p mobile_accounting < populate-subscription-plans.sql
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

6. **Test the API:**
   Navigate to `http://localhost:8080`

## 🔧 Configuration

### Environment Variables

The `.env` file contains sensitive information and is excluded from git. Use `.env.example` as a template:

- **Database**: MySQL connection details
- **JWT**: Secret key for token signing
- **Cloudinary**: File upload service credentials
- **Server**: Port and environment settings

## 🔐 Device-Based Authentication

### How It Works

1. **Registration**: User registers normally, `device_id` starts as `null`
2. **First Login**: User provides `device_id` (like MAC address), it gets saved
3. **Device Binding**: User can only login from the same device
4. **Security**: Different devices are blocked with clear error message
5. **Admin Override**: Admins can reset `device_id` for legitimate device changes

### Security Features

- **Device Binding**: Each user account bound to one device
- **JWT Tokens**: Include device_id for additional validation
- **Admin Controls**: Reset device IDs when needed
- **Clear Error Messages**: Informative security feedback

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login with device_id | No |
| GET | `/api/auth/subscription` | Check subscription status | Yes |
| POST | `/api/auth/upgrade-subscription` | Upgrade subscription | Yes |
| GET | `/api/auth/status` | Get user status | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/admin/users` | Get all users | Admin |
| POST | `/api/auth/admin/upgrade-user` | Upgrade any user's subscription | Admin |
| POST | `/api/auth/admin/update-user-status` | Update user status | Admin |
| POST | `/api/auth/admin/reset-user-device` | Reset user's device_id | Admin |

### Subscription Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/subscription-plans` | Get all subscription plans | No |
| GET | `/api/subscription-plans/:id` | Get specific plan | No |
| GET | `/api/subscriptions` | Get user's subscriptions | Yes |
| POST | `/api/subscriptions` | Create subscription | Yes |

### File Upload Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload/upload-image` | Upload image to Cloudinary | Yes |

## 📊 Subscription Plans

- **Free Trial**: 1 week access (status: 'new')
- **6 Month Plan**: 6 months access (status: 'active')
- **1 Year Plan**: 1 year access (status: 'active')
- **2 Year Plan**: 2 years access (status: 'active')

## 🎨 UI Components

- **Cards**: Information display and organization
- **Forms**: Input validation and user interaction
- **Modals**: Plan upgrade and confirmation dialogs
- **Progress Bars**: Subscription progress visualization
- **Statistics**: Key metrics display
- **Responsive Grid**: Mobile-friendly layout system

## 🔌 API Integration

The frontend integrates with your backend API endpoints:

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `GET /api/users/subscription` - Subscription status
- `POST /api/users/upgrade-subscription` - Plan upgrade
- `GET /api/users/status` - User account status

## 🚀 Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

## 🧪 Testing

### Test Users Created

The following test users are available for testing:

| Email | Password | Role | Subscription | Device ID |
|-------|----------|------|--------------|-----------|
| john.doe@example.com | password123 | user | free_trial | DEVICE_JOHN_DOE_001 |
| jane.smith@example.com | password123 | user | 1_month | DEVICE_JANE_SMITH_001 |
| admin2@admin.com | admin123456 | admin | lifetime | DEVICE_ADMIN_USER2_001 |

### Running Tests

```bash
# Create test users
node create-test-users.js

# Run comprehensive login tests
node login-test-suite.js

# Test device security
node login-demonstration.js
```

### Postman Collection

Import `Mobile_Accounting_API_Collection.json` into Postman for comprehensive API testing.

### Test Scenarios

1. **Device Security**: Try logging in with different device IDs
2. **Authentication**: Test valid/invalid credentials
3. **Admin Functions**: Test admin-only endpoints
4. **Subscription Management**: Test plan upgrades and status checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of your mobile accounting application.

## 🔒 Security Features

### Environment Security
- `.env` file excluded from git to prevent secret exposure
- `.env.example` template provided for setup
- Comprehensive `.gitignore` prevents sensitive data commits

### Authentication Security
- Device-based authentication prevents unauthorized access
- JWT tokens with device_id validation
- Password hashing with bcrypt
- Input validation and sanitization

### Database Security
- SQL injection prevention with Sequelize ORM
- Unique constraints on email and device_id
- Foreign key relationships for data integrity

## 🆘 Support

For issues or questions:
1. Check the server is running on port 8080
2. Verify environment variables are set correctly
3. Check database connection
4. Ensure all dependencies are installed
5. Review logs for error details

## 📄 License

This project is part of your mobile accounting application.

---

**Secure API Development! 🔐**
