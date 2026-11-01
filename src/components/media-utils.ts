export function formatTime(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

export function pauseOtherMedia(current: HTMLMediaElement) {
  document.querySelectorAll<HTMLMediaElement>('audio, video').forEach(media => {
    if (media !== current && !media.paused) media.pause();
  });
}
