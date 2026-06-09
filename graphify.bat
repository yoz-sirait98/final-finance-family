@echo off
setlocal
if not exist "graphify-out\.graphify_python" (
    echo graphify-out\.graphify_python not found. Please run the graphify scanner first.
    exit /b 1
)
set /p PY=<graphify-out\.graphify_python
"%PY%" -m graphify %*
