@echo off
echo Starting deployment process...

REM Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Git is not installed or not in PATH
    pause
    exit /b 1
)

REM Navigate to the project directory
cd /d "%~dp0"

REM Get GitHub username and token from user
set /p github_user="Enter your GitHub username: "
set /p github_token="Enter your GitHub Personal Access Token: "

REM Set the remote URL with credentials
git remote set-url origin https://%github_user%:%github_token%@github.com/%github_user%/vyr.git

echo Updating submodules...
git submodule update --init --recursive

echo Adding all changes...
git add .

echo Checking for changes...
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo No changes to commit
    pause
    exit /b 0
)

REM Get commit message from user
set /p commit_msg="Enter commit message: "

if "%commit_msg%"=="" (
    set commit_msg=Auto-deploy: update game
)

echo Creating commit...
git commit -m "%commit_msg%"

echo Pulling latest changes from remote...
git pull origin main --allow-unrelated-histories

if %errorlevel% neq 0 (
    echo Warning: Could not pull latest changes, proceeding with push anyway
)

echo Pushing to GitHub repository...
git push origin main

if %errorlevel% equ 0 (
    echo Repository has been successfully pushed to GitHub
    echo Vercel will auto-deploy in 10-30 seconds
) else (
    echo Failed to push to GitHub repository
    echo Possible causes:
    echo 1. No internet connection
    echo 2. Permission denied - check your GitHub credentials
    echo 3. Remote repository URL is incorrect
    echo 4. Local changes conflict with remote
    echo.
    echo To fix permission issues:
    echo 1. Generate a new Personal Access Token in GitHub Settings
    echo 2. Make sure you have write access to the repository
)

echo.
echo Deployment process completed.
pause