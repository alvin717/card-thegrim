@echo off
chcp 65001 > nul
echo ========================================================
echo [더 그림 이승국 CEO 모바일 명함] card-thegrim 배포 시작...
echo ========================================================
echo.

cd /d "%~dp0"
git add .
git commit -m "더 그림 이승국 대표 모바일 명함 업데이트 (%date% %time%)"
git push -u origin main

echo.
echo ========================================================
echo [배포 완료] 이승국 대표님 모바일 명함이 업로드되었습니다!
echo.
echo 🌐 이승국 대표 모바일 명함 웹 주소:
echo https://alvin717.github.io/card-thegrim/
echo.
echo 💬 카톡 전달용 (전화 바로연결):
echo https://alvin717.github.io/card-thegrim/?call=1
echo.
echo (※ 업로드 후 약 1~2분 뒤 인터넷에 정상 반영됩니다)
echo ========================================================
pause
