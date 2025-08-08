@echo off
echo ========================================
echo    LYN SALON MANAGEMENT SYSTEM
echo ========================================
echo.

echo [1/4] Dang kiem tra va kill cac process Node.js...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Da kill tat ca process Node.js
) else (
    echo ℹ️ Khong co process Node.js nao dang chay
)

echo.
echo [2/4] Dang kiem tra port 3000...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 van dang duoc su dung
    echo 🔍 Tim va kill process su dung port 3000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /f /pid %%a >nul 2>&1
        echo ✅ Da kill process PID: %%a
    )
) else (
    echo ✅ Port 3000 da san sang
)

echo.
echo [3/4] Dang cho 3 giay de dam bao port duoc giai phong...
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Dang khoi dong server...
echo 🚀 Server se chay tai: http://localhost:3000
echo.
echo ========================================
echo    NHAN CTRL+C DE DUNG SERVER
echo ========================================
echo.

node app.js

pause 