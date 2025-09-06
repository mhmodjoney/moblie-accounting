#!/bin/bash
# Reset to first commit and clean up

echo "Resetting to first commit..."
git reset --hard 3fbd6b1

echo "Cleaning working directory..."
git clean -fd

echo "Adding all changes..."
git add .

echo "Committing everything in one clean commit..."
git commit -m "Complete Mobile Accounting API with Device-Based Authentication

Features implemented:
- Device-based authentication system
- User registration and login with device binding
- Subscription management with multiple plans
- Admin panel with user management
- File upload with Cloudinary integration
- Comprehensive API documentation
- Security features and environment protection
- Test users and comprehensive testing suite
- Postman collection for API testing

Security:
- Environment variables for sensitive data
- Device binding prevents unauthorized access
- JWT tokens with device validation
- Password hashing and input validation
- Comprehensive .gitignore for security

API Endpoints:
- Authentication: register, login, subscription check
- Admin: user management, device reset, status updates
- Subscriptions: plan management and upgrades
- File upload: image upload to Cloudinary

Testing:
- 7 test users with different roles and subscriptions
- Device security testing
- Comprehensive login test suite
- Postman collection with all endpoints"

echo "Done! Ready to push."


