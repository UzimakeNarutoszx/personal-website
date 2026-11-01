import { useEffect, useId, useRef, useState } from 'react';
import type { Track } from '../data/types';
import { formatTime, pauseOtherMedia } from './media-utils';
import '../styles/media.css';

export default function MediaPlayer({ tracks, compact = false }: { tracks: Track[]; compact?: boolean }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(.75);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const audio = useRef<HTMLAudioElement>(null);
  const playAfterChange = useRef(false);
  const id = useId();
  const track = tracks[index];

  function play() {
    const element = audio.current;
    if (!element) return;
    setError('');
    setLoading(true);
    pauseOtherMedia(element);
    void element.play().catch(reason => {
      if (reason.name !== 'AbortError') {
        setLoading(false);
        setError('暂时无法播放，请再试一次或选择另一首。');
      }
    });
  }

  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    setPosition(0);
    setError('');
    setPlaying(false);
    if (playAfterChange.current) {
      playAfterChange.current = false;
      play();
    }
  }, [index]);

  function select(next: number, start = true) {
    if (next === index) { toggle(); return; }
    audio.current?.pause();
    playAfterChange.current = start;
    setIndex(next);
  }

  function toggle() {
    if (audio.current?.paused) play();
    else audio.current?.pause();
  }

  if (!track) return <p>音乐作品正在整理中。</p>;
  const duration = track.duration;
  return <div className={`music-player ${compact ? 'music-player-compact' : ''}`}>
    <div className="now-playing">
      <div className="album-art"><img src={track.cover} alt={`《${track.title}》封面`} width="480" height="480" loading="lazy" /><span className={`album-mark ${playing ? 'is-playing' : ''}`} aria-hidden="true"><i /><i /><i /><i /></span></div>
      <div className="now-playing-body">
        <p className="player-overline">殉乐集 <span>{index + 1} / {tracks.length}</span></p>
        <h3>{track.title}</h3><p className="track-artist">{track.artist}</p>
        <p className="track-description">{track.description}</p>
        <audio ref={audio} src={track.src} preload="none" onPlay={event => { pauseOtherMedia(event.currentTarget); setPlaying(true); }} onPlaying={() => setLoading(false)} onWaiting={() => setLoading(true)} onPause={() => { setPlaying(false); setLoading(false); }} onTimeUpdate={event => setPosition(event.currentTarget.currentTime)} onError={() => { setError('这首作品暂时无法播放，请选择另一首。'); setLoading(false); setPlaying(false); }} onEnded={() => {
          setPlaying(false);
          if (index < tracks.length - 1) select(index + 1);
          else setPosition(0);
        }} />
        <div className="seek-control"><label className="sr-only" htmlFor={`${id}-seek`}>播放进度</label><input id={`${id}-seek`} type="range" min="0" max={duration} step=".1" value={Math.min(position, duration)} aria-valuetext={`${formatTime(position)}，共 ${formatTime(duration)}`} onChange={event => { const time = Number(event.target.value); if (audio.current && audio.current.readyState > 0) { audio.current.currentTime = time; setPosition(time); } }} /><div className="time-labels"><span>{formatTime(position)}</span><span>{formatTime(duration)}</span></div></div>
        <div className="playback-controls">
          <button type="button" className="transport-button" aria-label="上一首" disabled={index === 0} onClick={() => select(index - 1)}><span aria-hidden="true">Ⅰ◀</span></button>
          <button type="button" className="main-play" aria-label={`${playing ? '暂停' : '播放'}《${track.title}》`} onClick={toggle}><span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span><span>{loading ? '载入中' : playing ? '暂停' : '播放'}</span></button>
          <button type="button" className="transport-button" aria-label="下一首" disabled={index === tracks.length - 1} onClick={() => select(index + 1)}><span aria-hidden="true">▶Ⅰ</span></button>
          <label className="volume-control"><span>音量</span><input aria-label="音量" type="range" min="0" max="1" step=".01" value={volume} onChange={event => setVolume(Number(event.target.value))} /></label>
        </div>
        {error && <p className="media-error" role="alert">{error} <button type="button" onClick={() => { audio.current?.load(); play(); }}>重试</button></p>}
        <p className="track-credit">{track.credit}</p>
      </div>
    </div>
    <div className="track-list" aria-label="选择音乐">{tracks.map((item, itemIndex) => <button className={`track-row ${itemIndex === index ? 'selected' : ''}`} type="button" key={item.id} aria-pressed={itemIndex === index} aria-label={`${itemIndex === index && playing ? '暂停' : '播放'}《${item.title}》`} onClick={() => select(itemIndex)}><span className="track-number" aria-hidden="true">{itemIndex === index && playing ? '♫' : String(itemIndex + 1).padStart(2, '0')}</span><img src={item.cover} alt="" width="48" height="48" loading="lazy" /><span className="track-row-title"><strong>{item.title}</strong><small>{item.artist}</small></span><span className="track-duration">{formatTime(item.duration)}</span><span className="track-action" aria-hidden="true">{itemIndex === index && playing ? 'Ⅱ' : '▷'}</span></button>)}</div>
  </div>;
}
