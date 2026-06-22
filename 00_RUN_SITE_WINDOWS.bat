@echo off
setlocal
cd /d "%~dp0"
title PickleLevel Local Site

echo.
echo ========================================
echo   PickleLevel - Windows One Click Run
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not found in PATH.
  echo Install Node.js LTS from https://nodejs.org/ and run this file again.
  echo.
  pause
  exit /b 1
)

echo Node found:
node -v
echo.

echo Building site...
node build.js
if errorlevel 1 (
  echo.
  echo ERROR: Build failed.
  echo Copy the error message and send it back for troubleshooting.
  echo.
  pause
  exit /b 1
)

echo.
echo Starting local preview server...
echo A browser window should open automatically.
echo.
node start-local.js

echo.
echo Server stopped.
pause
