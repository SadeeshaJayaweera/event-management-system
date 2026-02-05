#!/bin/bash

# Google OAuth Setup Script for Event Management System
# This script helps you set up Google OAuth credentials for local development

set -e

echo "=========================================="
echo "Google OAuth Setup for Event Management"
echo "=========================================="
echo ""

# Check if credentials are already set
if [ -f "frontend/.env.local" ]; then
    CURRENT_CLIENT_ID=$(grep "NEXT_PUBLIC_GOOGLE_CLIENT_ID" frontend/.env.local | cut -d'=' -f2)
    if [ ! -z "$CURRENT_CLIENT_ID" ] && [ "$CURRENT_CLIENT_ID" != "YOUR_NEW_CLIENT_ID.apps.googleusercontent.com" ]; then
        echo "Current Google Client ID: $CURRENT_CLIENT_ID"
        read -p "Do you want to update it? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipping setup..."
            exit 0
        fi
    fi
fi

echo ""
echo "To get your Google OAuth credentials:"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable Google+ API"
echo "4. Go to Credentials → Create OAuth 2.0 Client ID"
echo "5. Add authorized origins and redirect URIs"
echo ""

read -p "Enter your Google Client ID (xxx.apps.googleusercontent.com): " CLIENT_ID
read -p "Enter your Google Client Secret: " CLIENT_SECRET

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "Error: Client ID and Secret are required"
    exit 1
fi

# Update frontend .env.local
echo "Updating frontend/.env.local..."
if [ -f "frontend/.env.local" ]; then
    # Use sed to update existing values
    sed -i.bak "s|NEXT_PUBLIC_GOOGLE_CLIENT_ID=.*|NEXT_PUBLIC_GOOGLE_CLIENT_ID=$CLIENT_ID|" frontend/.env.local
    sed -i.bak "s|GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=$CLIENT_SECRET|" frontend/.env.local
    rm -f frontend/.env.local.bak
else
    # Create new file
    cat > frontend/.env.local << EOF
# API Gateway URL
API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=$CLIENT_ID
GOOGLE_CLIENT_SECRET=$CLIENT_SECRET

# NextAuth Configuration
NEXTAUTH_SECRET=iQWJPQRuc6xhVmCxzJjJjY3Ziy2OlM2/vrlE5x/A4ek=
NEXTAUTH_URL=http://localhost:3000
EOF
fi

echo "✓ Frontend configuration updated"

# Update backend application.yml
echo "Updating backend/user-service/src/main/resources/application.yml..."
BACKEND_CONFIG="backend/user-service/src/main/resources/application.yml"

if grep -q "GOOGLE_CLIENT_ID" "$BACKEND_CONFIG"; then
    # Already has placeholder, just update it
    sed -i.bak "s|client-id: \${GOOGLE_CLIENT_ID:.*}|client-id: \${GOOGLE_CLIENT_ID:$CLIENT_ID}|" "$BACKEND_CONFIG"
    rm -f "$BACKEND_CONFIG.bak"
else
    echo "Warning: Could not find GOOGLE_CLIENT_ID in backend config"
fi

echo "✓ Backend configuration updated"

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Rebuild Docker images:"
echo "   docker compose build"
echo ""
echo "2. Restart services:"
echo "   docker compose down"
echo "   docker compose up"
echo ""
echo "3. Test Google Sign-In:"
echo "   Open http://localhost:3000"
echo "   Click 'Sign In' → 'Sign in with Google'"
echo ""
echo "Credentials saved:"
echo "  Client ID: $CLIENT_ID"
echo "  Client Secret: (hidden)"
echo ""
echo "Note: Make sure you've added these URLs to Google OAuth:"
echo "  Authorized JavaScript Origins:"
echo "    - http://localhost:3000"
echo "    - http://localhost"
echo ""
echo "  Authorized Redirect URIs:"
echo "    - http://localhost:3000/auth/login"
echo "    - http://localhost:3000/auth/register"
echo ""
