@echo off
echo Starting Angverytime Front Server...

cd /d "%~dp0"
cd ..\

REM Check if we're in a deployment directory
if exist "simple-server.js" (
    echo Found simple-server.js, starting Node.js server...
    node simple-server.js
) else if exist "node_modules\.bin\http-server.cmd" (
    echo Found http-server, starting...
    node_modules\.bin\http-server.cmd . -p 8001 --cors -c-1 -s
) else (
    echo Installing http-server and starting...
    call pnpm add http-server
    if %errorlevel% equ 0 (
        call pnpm exec http-server . -p 8001 --cors -c-1 -s
    ) else (
        echo Failed to install http-server
        pause
    )
)

pause