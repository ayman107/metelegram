@echo off
setlocal
title MeClaw Render Deployment Helper 🚀

echo ==========================================
echo    MeClaw Bot Deployment Helper (Render)
echo ==========================================
echo.

:: 1. Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed! Please install git from https://git-scm.com/
    pause
    exit /b
)

:: 2. Initialize Git if needed
if not exist .git (
    echo [+] Initializing Git repository...
    git init
    git branch -M main
)

:: 3. Create .gitignore if it doesn't exist
if not exist .gitignore (
    echo node_modules/ > .gitignore
    echo dist/ >> .gitignore
    echo .env >> .gitignore
    echo *.db >> .gitignore
    echo *.log >> .gitignore
    echo service-account.json >> .gitignore
    echo [+] Created .gitignore (Skipping sensitive files)
)

:: 4. Stage files
echo [+] Staging all files...
git add .

:: 5. Commit
echo [+] Committing changes...
git commit -m "Prepare for Render.com deployment"

:: 6. Push to GitHub
echo.
echo ==========================================
echo  ACTION REQUIRED:
echo  1. Create a NEW PRIVATE repository on GitHub.
echo  2. Copy the URL (e.g., https://github.com/user/repo.git)
echo ==========================================
set /p REPO_URL="Enter your GitHub Repository URL: "

if "%REPO_URL%"=="" (
    echo [SKIP] Repository URL not provided. You will need to push manually.
) else (
    echo [+] Setting remote origin...
    git remote remove origin >nul 2>nul
    git remote add origin %REPO_URL%
    echo [+] Pushing to main branch...
    git push -u origin main
)

echo.
echo ==========================================
echo  DONE! Next steps:
echo  1. Go to https://dashboard.render.com
echo  2. Create a 'Web Service' from your GitHub repo.
echo  3. Add Environment Variables (from your .env file).
echo  4. Set 'Build Command' to: npm install && npm run build
echo  5. Set 'Start Command' to: npm start
echo ==========================================
pause
