@echo off
setlocal
cd /d "%~dp0"
title PickleLevel Local Site - Port 8080
set PORT=8080
node build.js
if errorlevel 1 pause & exit /b 1
node start-local.js
pause
