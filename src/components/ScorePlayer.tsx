import { useId, useRef, useState } from 'react';
import type { Score } from '../data/types';
import { formatTime, pauseOtherMedia } from './media-utils';
import '../styles/media.css';

export default function ScorePlayer({ score }: { score: Score }) {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState('');
  const id = useId();
  function toggle() {
    if (!video.current) return;
    if (video.current.paused) {
      setError('');
      pauseOtherMedia(video.current);
      void video.current.play().catch(reason => {
        if (reason.name !== 'AbortError') setError('暂时无法播放，请再试一次。');
      });
    } else video.current.pause();
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement === frame.current) await document.exitFullscreen();
      else if (frame.current?.requestFullscreen) await frame.current.requestFullscreen();
      else setError('当前浏览器不支持全屏，请在此页面继续观看。');
    } catch { setError('暂时无法进入全屏，请在此页面继续观看。'); }
  }
  return <article className="score-card">
    <div className="score-frame" ref={frame}>
      <video ref={video} src={score.src} poster={score.poster} preload="none" playsInline muted={muted} controlsList="nodownload" disablePictureInPicture aria-label={`${score.title}${score.kind}`} onPlay={event => { pauseOtherMedia(event.currentTarget); setPlaying(true); }} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onTimeUpdate={event => setPosition(event.currentTarget.currentTime)} onError={() => setError('这段动态谱暂时无法播放，请稍后再试。')} />
      {!playing && <button className="score-overlay-play" type="button" onClick={toggle} aria-label={`播放${score.title}`}><span aria-hidden="true">▶</span></button>}
      <div className="score-controls"><button type="button" aria-label={`${playing ? '暂停' : '播放'}${score.title}`} onClick={toggle}>{playing ? 'Ⅱ' : '▶'}</button><label className="sr-only" htmlFor={id}>{score.title}播放进度</label><input id={id} type="range" min="0" max={score.duration} step=".1" value={Math.min(position, score.duration)} aria-valuetext={`${formatTime(position)}，共 ${formatTime(score.duration)}`} onChange={event => { const time = Number(event.target.value); if (video.current && video.current.readyState > 0) { video.current.currentTime = time; setPosition(time); } }} /><span className="video-time">{formatTime(position)} / {formatTime(score.duration)}</span><button type="button" aria-label={muted ? '开启声音' : '静音'} onClick={() => setMuted(!muted)}>{muted ? '静音' : '声音'}</button><button type="button" aria-label={`${score.title}全屏`} onClick={fullscreen}>全屏</button></div>
    </div>
    <div className="score-description"><span className="score-kind">{score.kind}</span><h2>{score.title}</h2><p>{score.credit}</p>{error && <p className="media-error" role="alert">{error} <button type="button" onClick={() => { video.current?.load(); toggle(); }}>重试</button></p>}</div>
  </article>;
}
