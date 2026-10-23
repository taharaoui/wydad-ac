'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The Gold card film (Higgsfield MiniMax H3 render, black studio background, no alpha), encoded as
 * a forward-then-reverse loop so the end meets the start. Plays muted once visible; the first frame
 * shows while it loads; a front-facing still replaces it on error and for reduced motion.
 */
export function GoldCardStage({ alt }: { alt: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setStill(reduce.matches);
    apply();
    reduce.addEventListener('change', apply);
    return () => reduce.removeEventListener('change', apply);
  }, []);

  // Only spend bandwidth and battery while the stage is on screen
  useEffect(() => {
    const el = video.current;
    if (!el || still) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => setStill(true));
      else el.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [still]);

  return (
    <div className="relative aspect-square w-full">
      {/* Soft gold halo; the film's pure-black background is dropped with mix-blend-screen (it has no alpha) */}
      <div className="pointer-events-none absolute inset-[12%] rounded-full bg-[#E8C468]/15 blur-[90px]" aria-hidden />
      {still ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/videos/gold-card-still.jpg" alt={alt} className="relative h-full w-full object-cover mix-blend-screen [mask-image:radial-gradient(farthest-side,#000_88%,transparent)]" />
      ) : (
        <video
          ref={video}
          className="relative h-full w-full object-cover mix-blend-screen [mask-image:radial-gradient(farthest-side,#000_88%,transparent)]"
          poster="/videos/gold-card-poster.jpg"
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
          onError={() => setStill(true)}
        >
          <source src="/videos/gold-card.webm" type="video/webm" />
          <source src="/videos/gold-card.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
