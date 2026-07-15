@echo off
setlocal
cd /d "%~dp0"
title Picklary Clip Lite Local Preview

echo.
echo ========================================
echo   Picklary Clip Lite - Local Preview
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

echo [1/2] Building Picklary and Clip Lite...
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
echo [2/2] Opening Clip Lite in your browser...
set "OPEN_PATH=/clip-lite/"
node start-local.js

echo.
echo Local preview server stopped.
pause
