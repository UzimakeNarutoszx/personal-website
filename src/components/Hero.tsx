import { useEffect, useRef, useState } from 'react';
import '../styles/hero.css';

export default function Hero() {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      if (preference.matches) { video.current?.pause(); setPaused(true); }
      else { void video.current?.play().catch(() => setPaused(true)); }
    };
    sync();
    preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, []);
  return <section className="creative-hero" aria-label="昔日烬 · 枢，声音与代码">
    <div className="creative-media" aria-hidden="true">
      <video ref={video} src="https://r2.motionsites.dev/motionsites/assets/0cef950902b6.mp4" poster="/assets/creative-poster.webp" muted loop playsInline preload="metadata" onPlay={() => setPaused(false)} onPause={() => setPaused(true)} tabIndex={-1} />
      <span className="edge edge-top" /><span className="edge edge-right" /><span className="edge edge-bottom" /><span className="edge edge-left" />
    </div>
    <div className="creative-content">
      <h1><span className="creative-serif">昔日烬，</span><span className="creative-grotesk">不止一种表达</span></h1>
      <p className="creative-english">Sound, code &amp; curiosity</p>
      <p className="creative-description">以殉乐写下旋律，以 ENS 构建想法。<br />在声音、代码和好奇心之间，继续探索。</p>
    </div>
    <div className="creative-footer">
      <span>© {new Date().getFullYear()} 昔日烬 · 枢</span>
      <a className="creative-scroll" href="#selected" aria-label="向下浏览作品"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></a>
      <div className="creative-footer-links"><button type="button" aria-label={paused ? '播放背景动效' : '暂停背景动效'} onClick={() => { if (paused) void video.current?.play().catch(() => setPaused(true)); else video.current?.pause(); }}>{paused ? '动效已暂停' : '暂停动效'}</button><a href="/music/">殉乐</a><a href="/projects/">ENS</a><a href="/about/">关于</a></div>
    </div>
  </section>;
}
