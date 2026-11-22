#!/usr/bin/env bash
# 生成限速友好的媒体版本：音频 96k MP3、动态鼓谱 540p H.264、宣传片 720p、Hero 循环。
# 原始文件保留在 media-src/（Git 忽略）；产物写入 public/media 与 public/assets。
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="media-src"
OUT="public/media"
mkdir -p "$SRC/audio" "$SRC/scores" "$SRC/projects-video" "$SRC/hero" "$OUT/audio" "$OUT/scores"

copy_once() {
  local from="$1" to="$2"
  [ -e "$to" ] || cp -p "$from" "$to"
}

for f in "$OUT"/audio/*.mp3; do
  base="$(basename "$f")"
  copy_once "$f" "$SRC/audio/$base"
  ffmpeg -y -v error -i "$SRC/audio/$base" -map 0:a -map_metadata 0 -vn -codec:a libmp3lame -b:a 80k "$OUT/audio/$base"
  echo "audio $base $(du -h "$OUT/audio/$base" | cut -f1)"
done

for f in "$OUT"/scores/*.mp4; do
  base="$(basename "$f")"
  copy_once "$f" "$SRC/scores/$base"
  ffmpeg -y -v error -i "$SRC/scores/$base" \
    -vf "scale=960:-2:flags=lanczos,fps=24" \
    -c:v libx264 -preset medium -crf 28 -pix_fmt yuv420p \
    -c:a aac -b:a 96k -movflags +faststart "$OUT/scores/$base"
  echo "score $base $(du -h "$OUT/scores/$base" | cut -f1)"
done

for f in public/assets/projects/video/*.mp4; do
  base="$(basename "$f")"
  copy_once "$f" "$SRC/projects-video/$base"
  ffmpeg -y -v error -i "$SRC/projects-video/$base" \
    -vf "scale=720:-2:flags=lanczos" \
    -c:v libx264 -preset medium -crf 28 -pix_fmt yuv420p \
    -c:a aac -b:a 96k -movflags +faststart "$f"
  echo "promo $base $(du -h "$f" | cut -f1)"
done

if [ -f "$SRC/hero/hero.mp4" ]; then
  ffmpeg -y -v error -i "$SRC/hero/hero.mp4" -an \
    -vf "scale=1280:-2:flags=lanczos,fps=24" \
    -c:v libx264 -preset medium -crf 30 -pix_fmt yuv420p -movflags +faststart \
    public/assets/creative-loop.mp4
  echo "hero $(du -h public/assets/creative-loop.mp4 | cut -f1)"
fi
