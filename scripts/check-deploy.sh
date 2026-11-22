#!/usr/bin/env bash
# 部署后 smoke：页面、媒体 Range、缓存、404。
set -euo pipefail
BASE="${1:-https://jianwen.xin/personal}"
fail=0
check() { local label="$1" want="$2" url="$3" extra="${4:-}"; local code; code=$(curl -s -o /dev/null -m 20 -w '%{http_code}' $extra "$url"); printf '%-42s %s (want %s)\n' "$label" "$code" "$want"; [ "$code" = "$want" ] || fail=1; }
for page in "" "projects/" "projects/jianwen/" "music/" "scores/" "about/"; do check "page /$page" 200 "$BASE/$page"; done
check "404 page" 404 "$BASE/no-such-page"
check "hero video" 200 "$BASE/assets/creative-loop.mp4"
check "audio range" 206 "$BASE/media/audio/beginning.mp3" "-H Range:bytes=0-99"
check "score range" 206 "$BASE/media/scores/counting-stars.mp4" "-H Range:bytes=0-99"
check "hashed asset" 200 "$(curl -s -m 20 "$BASE/" | grep -o '/personal/_astro/[^"]*\.css' | head -1 | sed 's|^/personal|'"$BASE"'|')"
printf '%-42s ' "media cache header"; curl -sI -m 20 "$BASE/media/audio/beginning.mp3" | tr -d '\r' | grep -i '^cache-control' | head -1 || true
[ "$fail" = 0 ] && echo "check-deploy: OK" || { echo "check-deploy: FAILED"; exit 1; }
