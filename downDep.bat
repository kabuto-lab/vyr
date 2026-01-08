@echo off
REM Batch script to download (clone) a repository

REM Check if repository URL is provided
if "%~1"=="" (
    echo Usage: %0 ^<repository_URL^>
    echo Example: %0 https://github.com/username/repository.git
    exit /b 1
)

REM Clone the repository
echo Cloning repository: %1
git clone %1

REM Check if git clone was successful
if %errorlevel% neq 0 (
    echo Error: Failed to clone the repository
    exit /b 1
)

echo Repository successfully downloaded!