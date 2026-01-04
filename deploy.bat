@echo off
cd /d "%~dp0"

:: Добавляем все изменения
git add .

:: Коммитим с сообщением (можно заменить)
git commit -m "Auto-deploy: update game"

:: Пушим в main
git push origin main

echo.
echo ✅ Changes pushed to GitHub!
echo Vercel will auto-deploy in 10-30 seconds.
echo.
pause