@echo off
echo Initializing git repository and pushing to GitHub...

REM Navigate to the project directory
cd /d "C:\__Qwen1\vyrus\VYRU5\VYRU6\v1a"

REM Initialize git repository if not already initialized
if not exist .git (
    echo Initializing new git repository...
    git init
)

REM Add the remote origin
git remote remove origin 2>nul
git remote add origin https://github.com/kabuto-lab/vyr.git

REM Add all files to the repository
echo Adding all files...
git add .

REM Commit all changes
echo Creating commit...
git commit -m "Initial commit of VYRUS game project"

REM Push to the remote repository (create main branch if it doesn't exist)
echo Pushing to GitHub repository...
git branch -M main
git push -u origin main

echo.
echo Repository has been pushed to https://github.com/kabuto-lab/vyr
echo Press any key to exit...
pause >nul