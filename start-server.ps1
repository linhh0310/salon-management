# LYN SALON MANAGEMENT SYSTEM - START SERVER SCRIPT
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    LYN SALON MANAGEMENT SYSTEM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Đang kiểm tra và kill các process Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "✅ Đã kill tất cả process Node.js" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Không có process Node.js nào đang chạy" -ForegroundColor Blue
}

Write-Host ""
Write-Host "[2/4] Đang kiểm tra port 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "⚠️ Port 3000 vẫn đang được sử dụng" -ForegroundColor Red
    Write-Host "🔍 Tìm và kill process sử dụng port 3000..." -ForegroundColor Yellow
    foreach ($connection in $port3000) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            $process | Stop-Process -Force
            Write-Host "✅ Đã kill process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Green
        }
    }
} else {
    Write-Host "✅ Port 3000 đã sẵn sàng" -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/4] Đang chờ 3 giây để đảm bảo port được giải phóng..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[4/4] Đang khởi động server..." -ForegroundColor Yellow
Write-Host "🚀 Server sẽ chạy tại: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    NHẤN CTRL+C ĐỂ DỪNG SERVER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Khởi động server
node app.js 