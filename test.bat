@echo off
setlocal

cd /d "%~dp0"

if /I "%~1"=="--help" goto help
if /I "%~1"=="-h" goto help

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm.cmd was not found. Please install Node.js or add it to PATH.
  exit /b 1
)

set "host=127.0.0.1"
set "port=%~1"
if not defined port set "port=4321"

echo.
echo [1/2] Building site...
set ASTRO_TELEMETRY_DISABLED=1
call npm.cmd run build
if errorlevel 1 (
  echo.
  echo Build failed. Preview was not started.
  exit /b 1
)

echo.
echo [2/2] Starting local preview...
set "preview_url=http://%host%:%port%/CatBox/"
echo Open this URL:
echo   %preview_url%
echo.
echo Press Ctrl+C to stop the preview server.
powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process '%preview_url%'" >nul 2>nul
call npm.cmd run preview -- --host %host% --port %port%
exit /b %errorlevel%

:help
echo Usage:
echo   test.bat
echo   test.bat 4322
echo.
echo The script builds the static site and starts Astro preview locally.
echo It also opens http://127.0.0.1:4321/CatBox/ in your default browser.
exit /b 0
