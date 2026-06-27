# Tickly 설치 스크립트 (Windows)
#   irm https://raw.githubusercontent.com/kim-taehan/tickly/main/install.ps1 | iex
$ErrorActionPreference = "Stop"

$url = "https://github.com/kim-taehan/tickly/releases/latest/download/Tickly-Setup-x64.exe"
$out = "$env:TEMP\Tickly-Setup.exe"

Write-Host "⬇️  Tickly 다운로드 중..."
Invoke-WebRequest -Uri $url -OutFile $out

Write-Host "📦 설치 중..."
# NSIS oneClick 무인 설치
Start-Process -FilePath $out -ArgumentList "/S" -Wait

Write-Host "✅ 설치 완료! 시작 메뉴에서 Tickly 실행"
