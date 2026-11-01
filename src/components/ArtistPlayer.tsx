import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import type { Track } from '../data/types';
import { formatTime, pauseOtherMedia } from './media-utils';

export default function ArtistPlayer({ tracks }: { tracks: Track[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(.75);
  const [error, setError] = useState('');
  const audio = useRef<HTMLAudioElement>(null);
  const wave = useRef<HTMLCanvasElement>(null);
  const album = useRef<HTMLButtonElement>(null);
  const autoPlayNext = useRef(false);
  const id = useId();
  const track = tracks[index];

  function play() {
    if (!audio.current) return;
    setError('');
    pauseOtherMedia(audio.current);
    void audio.current.play().catch(reason => {
      if (reason.name !== 'AbortError') setError('暂时无法播放，请重试或选择另一首。');
    });
  }
  function toggle() { if (audio.current?.paused) play(); else audio.current?.pause(); }
  function select(next: number) {
    if (next === index) return toggle();
    audio.current?.pause(); autoPlayNext.current = true; setIndex(next);
  }
  useEffect(() => {
    setPosition(0); setError(''); setPlaying(false);
    if (autoPlayNext.current) { autoPlayNext.current = false; play(); }
  }, [index]);
  useEffect(() => { if (audio.current) audio.current.volume = volume; }, [volume]);
  useEffect(() => {
    const canvas = wave.current;
    const context = canvas?.getContext('2d');
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (!canvas || !context || !playing) return;
    let frame = 0, request = 0;
    function draw() {
      if (!canvas || !context) return;
      const width = canvas.clientWidth, height = 90;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== height * dpr) {
        canvas.width = Math.round(width * dpr); canvas.height = height * dpr;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0); context.clearRect(0, 0, width, height);
      context.strokeStyle = 'rgba(239,233,222,.32)'; context.lineWidth = 1;
      context.beginPath();
      for (let x = 0; x <= width; x += 4) {
        const energy = Math.sin(x * .13 + frame * .09) * Math.sin(x * .031 - frame * .04);
        const y = height / 2 + energy * (9 + 8 * Math.sin(frame * .03 + x * .01));
        if (!x) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.stroke(); frame++;
      if (!preference.matches) request = requestAnimationFrame(draw);
    }
    function sync() { cancelAnimationFrame(request); draw(); }
    sync(); preference.addEventListener('change', sync);
    return () => { cancelAnimationFrame(request); preference.removeEventListener('change', sync); };
  }, [playing]);
  function tilt(event: PointerEvent<HTMLButtonElement>) {
    if (!album.current || event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    album.current.style.setProperty('--rx', `${((event.clientY - rect.top) / rect.height - .5) * -18}deg`);
    album.current.style.setProperty('--ry', `${((event.clientX - rect.left) / rect.width - .5) * 24}deg`);
  }
  if (!track) return null;
  const duration = track.duration;
  return <div className="artist-player">
    <section className="artist-release" id="release" aria-label="作品试听">
      <div className="artist-section-line"><span>殉乐集 / Original recordings</span><span>{tracks.length} 首原创音乐</span></div>
      <div className="artist-release-heading"><p>留在声音里的</p><h2>那些片刻</h2></div>
      <div className="artist-album-stage">
        <canvas ref={wave} className={`artist-wave ${playing ? 'visible' : ''}`} aria-hidden="true" />
        <button ref={album} className="artist-album" type="button" aria-label={`${playing ? '暂停' : '播放'}《${track.title}》`} onClick={toggle} onPointerMove={tilt} onPointerLeave={() => { album.current?.style.setProperty('--rx', '0deg'); album.current?.style.setProperty('--ry', '0deg'); }}>
          <img src={track.cover} alt={`《${track.title}》封面`} width="480" height="480" />
          <span className="artist-album-play" aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span><span className="artist-album-label">{playing ? '暂停试听' : '点击聆听'}</span>
        </button>
      </div>
      <div className="artist-current"><h3>{track.title}</h3><p>{track.description}</p></div>
      <audio ref={audio} src={track.src} preload="none" onPlay={event => { pauseOtherMedia(event.currentTarget); setPlaying(true); }} onPause={() => setPlaying(false)} onTimeUpdate={event => setPosition(event.currentTarget.currentTime)} onError={() => { setError('这首作品暂时无法播放，请选择另一首。'); setPlaying(false); }} onEnded={() => { setPlaying(false); if (index < tracks.length - 1) select(index + 1); else setPosition(0); }} />
      <div className="artist-controls">
        <div className="artist-transport"><button type="button" aria-label="上一首" disabled={index === 0} onClick={() => select(index - 1)}>Ⅰ◀</button><button className="artist-toggle" type="button" aria-label={`${playing ? '暂停' : '播放'}当前作品`} onClick={toggle}>{playing ? '暂停' : '播放'}</button><button type="button" aria-label="下一首" disabled={index === tracks.length - 1} onClick={() => select(index + 1)}>▶Ⅰ</button></div>
        <label className="sr-only" htmlFor={`${id}-seek`}>播放进度</label><input id={`${id}-seek`} aria-valuetext={`${formatTime(position)}，共 ${formatTime(duration)}`} type="range" min="0" max={duration} step=".1" value={Math.min(position, duration)} onChange={event => { if (audio.current && audio.current.readyState > 0) { audio.current.currentTime = Number(event.target.value); setPosition(Number(event.target.value)); } }} />
        <span className="artist-time">{formatTime(position)} / {formatTime(duration)}</span>
        <label className="artist-volume">音量<input aria-label="音量" type="range" min="0" max="1" step=".01" value={volume} onChange={event => setVolume(Number(event.target.value))} /></label>
      </div>
      {error && <p className="artist-error" role="alert">{error} <button type="button" onClick={() => { audio.current?.load(); play(); }}>重试</button></p>}
    </section>
    <section className="artist-track-section" id="tracklist" aria-label="全部原创音乐">
      <div className="artist-section-line"><h2>曲目</h2><span>选择一首，开始聆听</span></div>
      <div className="artist-track-head" aria-hidden="true"><span>序</span><span>作品</span><span>创作者</span><span>时长</span><span /></div>
      <div className="artist-track-list">{tracks.map((item, i) => <button key={item.id} type="button" className={`artist-track ${index === i ? 'selected' : ''}`} style={{ '--progress': `${index === i ? position / duration * 100 : 0}%` } as CSSProperties} aria-label={`${index === i && playing ? '暂停' : '播放'}《${item.title}》`} aria-pressed={index === i && playing} onClick={() => select(i)}><span className="artist-track-number">{String(i + 1).padStart(2, '0')}</span><span className="artist-track-title"><img src={item.cover} alt="" width="48" height="48" loading="lazy" /><strong>{item.title}</strong></span><span className="artist-track-credit">{item.artist}</span><span>{formatTime(item.duration)}</span><span aria-hidden="true">{index === i && playing ? 'Ⅱ' : '↗'}</span></button>)}</div>
      <div className="artist-track-bottom"><p>旋律之外，让节拍继续</p><a className="artist-pill" href="/scores/">动态鼓谱与伴奏 <span aria-hidden="true">↗</span></a></div>
    </section>
  </div>;
}
