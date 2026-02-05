@echo off
REM Google OAuth Setup Script for Event Management System (Windows)

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo Google OAuth Setup for Event Management
echo ==========================================
echo.

REM Check if credentials are already set
if exist "frontend\.env.local" (
    for /f "tokens=2 delims==" %%A in ('findstr "NEXT_PUBLIC_GOOGLE_CLIENT_ID" frontend\.env.local') do (
        set "CURRENT_CLIENT_ID=%%A"
    )
    if not "!CURRENT_CLIENT_ID!"=="" (
        echo Current Google Client ID: !CURRENT_CLIENT_ID!
        set /p UPDATE="Do you want to update it? (y/n): "
        if /i not "!UPDATE!"=="y" (
            echo Skipping setup...
            exit /b 0
        )
    )
)

echo.
echo To get your Google OAuth credentials:
echo 1. Go to https://console.cloud.google.com/
echo 2. Create a new project or select existing one
echo 3. Enable Google+ API
echo 4. Go to Credentials ^> Create OAuth 2.0 Client ID
echo 5. Add authorized origins and redirect URIs
echo.

set /p CLIENT_ID="Enter your Google Client ID (xxx.apps.googleusercontent.com): "
set /p CLIENT_SECRET="Enter your Google Client Secret: "

if "!CLIENT_ID!"=="" (
    echo Error: Client ID is required
    exit /b 1
)

if "!CLIENT_SECRET!"=="" (
    echo Error: Client Secret is required
    exit /b 1
)

REM Update frontend .env.local
echo Updating frontend\.env.local...

if exist "frontend\.env.local" (
    REM Create temporary file with updated values
    (
        for /f "delims=" %%A in (frontend\.env.local) do (
            set "line=%%A"
            if "!line:NEXT_PUBLIC_GOOGLE_CLIENT_ID=!"=="!line!" (
                echo !line!
            ) else (
                echo NEXT_PUBLIC_GOOGLE_CLIENT_ID=!CLIENT_ID!
            )
        )
    ) > frontend\.env.local.tmp
    
    REM Replace original file
    move /y frontend\.env.local.tmp frontend\.env.local
    
    REM Update CLIENT_SECRET
    (
        for /f "delims=" %%A in (frontend\.env.local) do (
            set "line=%%A"
            if "!line:GOOGLE_CLIENT_SECRET=!"=="!line!" (
                echo !line!
            ) else (
                echo GOOGLE_CLIENT_SECRET=!CLIENT_SECRET!
            )
        )
    ) > frontend\.env.local.tmp
    
    move /y frontend\.env.local.tmp frontend\.env.local
) else (
    (
        echo # API Gateway URL
        echo API_GATEWAY_URL=http://localhost:8080
        echo NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
        echo.
        echo # Google OAuth Configuration
        echo NEXT_PUBLIC_GOOGLE_CLIENT_ID=!CLIENT_ID!
        echo GOOGLE_CLIENT_SECRET=!CLIENT_SECRET!
        echo.
        echo # NextAuth Configuration
        echo NEXTAUTH_SECRET=iQWJPQRuc6xhVmCxzJjJjY3Ziy2OlM2/vrlE5x/A4ek=
        echo NEXTAUTH_URL=http://localhost:3000
    ) > frontend\.env.local
)

echo ✓ Frontend configuration updated

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Rebuild Docker images:
echo    docker compose build
echo.
echo 2. Restart services:
echo    docker compose down
echo    docker compose up
echo.
echo 3. Test Google Sign-In:
echo    Open http://localhost:3000
echo    Click 'Sign In' ^> 'Sign in with Google'
echo.
echo Credentials saved:
echo   Client ID: !CLIENT_ID!
echo   Client Secret: (hidden)
echo.
echo Note: Make sure you've added these URLs to Google OAuth:
echo   Authorized JavaScript Origins:
echo     - http://localhost:3000
echo     - http://localhost
echo.
echo   Authorized Redirect URIs:
echo     - http://localhost:3000/auth/login
echo     - http://localhost:3000/auth/register
echo.
pause
