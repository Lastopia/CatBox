@echo off
setlocal

cd /d "%~dp0"

if /I "%~1"=="--help" goto help
if /I "%~1"=="-h" goto help

where git >nul 2>nul
if errorlevel 1 (
  echo Git was not found. Please install Git or add it to PATH.
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm.cmd was not found. Please install Node.js or add it to PATH.
  exit /b 1
)

echo.
echo [1/4] Building site...
set ASTRO_TELEMETRY_DISABLED=1
call npm.cmd run build
if errorlevel 1 (
  echo.
  echo Build failed. Nothing was committed.
  exit /b 1
)

echo.
echo [2/4] Staging changes...
git status --short
git add -A

git diff --cached --quiet
if not errorlevel 1 (
  echo.
  echo No changes to commit.
  exit /b 0
)

set "commit_msg=%*"
if not defined commit_msg (
  for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd-HHmmss"') do set "stamp=%%i"
  set "commit_msg=Update site content %stamp%"
)

echo.
echo [3/4] Committing changes...
git commit -m "%commit_msg%"
if errorlevel 1 (
  echo.
  echo Commit failed.
  exit /b 1
)

echo.
echo [4/4] Pushing to GitHub...
git push origin HEAD
if errorlevel 1 (
  echo.
  echo Push failed. The commit was created locally but was not uploaded.
  exit /b 1
)

echo.
echo Done. GitHub Actions will deploy the site after the push.
exit /b 0

:help
echo Usage:
echo   publish.bat
echo   publish.bat "Your commit message"
echo.
echo The script builds the site, stages all changes, commits them, and pushes the current branch.
exit /b 0
