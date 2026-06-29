#!/bin/bash
# Tickly 설치 스크립트
#   curl -fsSL https://raw.githubusercontent.com/kim-taehan/tickly/main/install.sh | bash
set -euo pipefail

REPO="kim-taehan/tickly"
APP="/Applications/Tickly.app"

case "$(uname -m)" in
  arm64)  ASSET="Tickly-mac-arm64.zip" ;;
  x86_64) ASSET="Tickly-mac-x64.zip" ;;
  *) echo "지원하지 않는 아키텍처: $(uname -m)"; exit 1 ;;
esac

URL="https://github.com/${REPO}/releases/latest/download/${ASSET}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "⬇️  Tickly 다운로드 중... (${ASSET})"
curl -fL --progress-bar "$URL" -o "$TMP/tickly.zip"

echo "📦 압축 해제..."
unzip -q "$TMP/tickly.zip" -d "$TMP"

echo "🚚 ${APP} 로 설치..."
rm -rf "$APP"
mv "$TMP/Tickly.app" "$APP"

# 미서명 앱이라 Gatekeeper quarantine 제거 (설치 사용자 동의 하에).
# /usr/bin/xattr 명시: pyenv 등 PATH의 xattr 샤임은 -r 미지원이라 우회.
/usr/bin/xattr -dr com.apple.quarantine "$APP" 2>/dev/null || true

echo "✅ 설치 완료! Launchpad 또는 /Applications 에서 Tickly 실행"
