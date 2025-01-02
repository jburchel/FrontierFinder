@echo off
setlocal

:: Get current branch name
for /f "tokens=*" %%a in ('git symbolic-ref --short HEAD') do set BRANCH=%%a

:: Get current timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set datetime=%%a
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%

echo Current branch: %BRANCH%

:: Stage all changes
git add .

:: Show status
echo.
echo Current status:
git status

:: Prompt for commit message
echo.
set /p commit_message=Enter commit message (press enter to use timestamp as message): 

:: If no message provided, use timestamp
if "%commit_message%"=="" set commit_message=Update %TIMESTAMP%

:: Commit changes
git commit -m "%commit_message%"

:: Push to remote
echo.
echo Pushing to remote...
git push origin %BRANCH%

echo.
echo Done!

endlocal 