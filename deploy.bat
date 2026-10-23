@echo off
chcp 65001 >nul
title GitHub ga avtomat yuklash - EduMemory
echo.
echo ====================================================
echo  65-maktab "EduMemory" - GitHub ga yuklash skripti
echo ====================================================
echo.
echo Loyiha fayllari GitHub ga push qilinmoqda...
git add -A
git commit -m "Auto deploy EduMemory"
git branch -M main
git remote set-url origin https://github.com/itshahar29-design/EEE.git
git push -u origin main --force
echo.
echo ====================================================
echo  Tayyor! GitHub ga muvaffaqiyatli yuklandi.
echo ====================================================
echo.
pause
