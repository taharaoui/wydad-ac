'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export interface HeroSlide {
  id: string;
  image: string;
  /** CSS object-position for the photo, e.g. "center 78%" */
  imagePosition?: string;
  /** Portrait club graphic: framed poster beside the text on desktop, over a blurred copy of itself */
  poster?: boolean;
  /** Shown in the progress tabs */
  label: string;
  content: ReactNode;
}

const DURATION = 8000;

/**
 * Full-bleed hero carousel: slides scroll horizontally on a track (looping seamlessly via edge clones),
 * auto-advance with a progress bar per slide, pause on hover/focus, arrows, keyboard and drag-to-swipe.
 */
export function HeroSlider({ slides, prevLabel, nextLabel }: { slides: HeroSlide[]; prevLabel: string; nextLabel: string }) {
  const count = slides.length;
  const loop = count > 1;
  // Track position: with clones, 0 is a copy of the last slide and count + 1 a copy of the first
  const [pos, setPos] = useState(loop ? 1 : 0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const touch = useRef<{ x: number; y: number; axis?: 'x' | 'y' } | null>(null);

  const index = loop ? (((pos - 1) % count) + count) % count : 0;

  const step = useCallback(
    (delta: number) => {
      if (!loop) return;
      setAnimate(true);
      setPos((p) => Math.min(count + 1, Math.max(0, p + delta)));
      setProgress(0);
    },
    [count, loop],
  );

  const goTo = (i: number) => {
    setAnimate(true);
    setPos(i + 1);
    setProgress(0);
  };

  // After landing on a clone, jump to the real slide without animating
  const onTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget) return;
    if (pos === 0 || pos === count + 1) {
      setAnimate(false);
      setPos(pos === 0 ? count : 1);
    }
  };

  // With reduced motion there is no transition (so no transitionend): leave a clone right away
  useEffect(() => {
    if ((pos === 0 || pos === count + 1) && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimate(false);
      setPos(pos === 0 ? count : 1);
    }
  }, [pos, count]);

  // Re-enable the transition once the silent jump has painted
  useEffect(() => {
    if (animate) return;
    let f2 = 0;
    const f1 = requestAnimationFrame(() => {
      f2 = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(f1);
      cancelAnimationFrame(f2);
    };
  }, [animate]);

  // Progress clock: advances while not paused, scrolls on when it fills
  useEffect(() => {
    if (!loop || paused || drag !== null) return;
    let last = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setProgress((p) => {
        const next = p + dt / DURATION;
        if (next >= 1) {
          setAnimate(true);
          setPos((x) => Math.min(count + 1, x + 1));
          return 0;
        }
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [count, loop, paused, drag]);

  const arrow = (dir: 1 | -1) => (
    <button
      type="button"
      onClick={() => step(dir)}
      aria-label={dir === 1 ? nextLabel : prevLabel}
      className="flex h-11 w-11 items-center justify-center bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-wydad-logo"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
        <polyline points={dir === 1 ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
      </svg>
    </button>
  );

  // Edge clones make the loop scroll forward from the last slide to the first
  const track = loop
    ? [
        { slide: slides[count - 1], key: 'clone-last', real: -1 },
        ...slides.map((slide, i) => ({ slide, key: slide.id, real: i })),
        { slide: slides[0], key: 'clone-first', real: -1 },
      ]
    : slides.map((slide, i) => ({ slide, key: slide.id, real: i }));

  return (
    <section
      className="relative min-h-[85vh] touch-pan-y overflow-hidden bg-black sm:min-h-screen"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
        if (e.key === 'ArrowRight') step(rtl ? -1 : 1);
        if (e.key === 'ArrowLeft') step(rtl ? 1 : -1);
      }}
      onTouchStart={(e) => {
        if (!loop) return;
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchMove={(e) => {
        const t = touch.current;
        if (!t) return;
        const dx = e.touches[0].clientX - t.x;
        const dy = e.touches[0].clientY - t.y;
        // Lock to the first clear direction so vertical page scrolling still works
        if (!t.axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) t.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (t.axis === 'x') setDrag(dx);
      }}
      onTouchEnd={(e) => {
        const t = touch.current;
        touch.current = null;
        if (!t || t.axis !== 'x') return setDrag(null);
        const dx = e.changedTouches[0].clientX - t.x;
        setDrag(null);
        if (Math.abs(dx) < e.currentTarget.clientWidth * 0.15) return;
        const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
        step((dx < 0) !== rtl ? 1 : -1);
      }}
    >
      <div
        className={`absolute inset-0 flex [transform:translateX(calc(var(--p)*-100%_+_var(--dx)))] rtl:[transform:translateX(calc(var(--p)*100%_+_var(--dx)))] ${
          animate && drag === null ? 'transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none' : ''
        }`}
        style={{ '--p': pos, '--dx': `${drag ?? 0}px` } as CSSProperties}
        onTransitionEnd={onTransitionEnd}
      >
        {track.map(({ slide, key, real }, i) => {
          const on = i === pos;
          const clone = real === -1;
          return (
            <div
              key={key}
              role={clone ? undefined : 'group'}
              aria-roledescription={clone ? undefined : 'slide'}
              aria-label={clone ? undefined : `${real + 1} / ${count}`}
              aria-hidden={!on || clone}
              {...({ inert: on && !clone ? undefined : '' } as object)}
              className="relative h-full w-full shrink-0 overflow-hidden"
            >
              <Image
                src={slide.image}
                alt=""
                fill
                priority={real === 0}
                sizes="100vw"
                className={`object-cover transition-transform duration-[9000ms] ease-out ${slide.poster ? 'lg:scale-110 lg:opacity-40 lg:blur-2xl' : ''} ${on ? 'scale-105' : 'scale-100'}`}
                style={{ objectPosition: slide.imagePosition ?? 'center' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent rtl:bg-gradient-to-l" />

              {/* Poster graphics carry their own lettering: darken more under the title on small screens */}
              {slide.poster && <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/0 lg:hidden" />}

              {/* Poster slides: the full graphic, uncropped, on the end side (desktop) */}
              {slide.poster && (
                <div className="absolute inset-0 hidden lg:block">
                  <div className="relative mx-auto h-full max-w-7xl px-8">
                    <div className="absolute bottom-36 end-8 top-[11.5rem] aspect-[4/5] overflow-hidden shadow-[0_30px_80px_rgb(0_0_0/0.6)] ring-1 ring-white/10">
                      <Image src={slide.image} alt="" fill sizes="480px" className="object-cover" />
                    </div>
                  </div>
                </div>
              )}

              <div className="relative flex h-full items-end">
                <div className="mx-auto w-full max-w-7xl px-4 pb-32 sm:px-6 sm:pb-36 lg:px-8 lg:pb-40">
                  <div className={slide.poster ? 'lg:max-w-[52%] xl:max-w-[56%]' : ''}>{slide.content}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide tabs with progress + arrows */}
      {loop && (
        <div className="absolute inset-x-0 bottom-16 z-20 sm:bottom-20">
          <div className="mx-auto flex max-w-7xl items-end gap-4 px-4 sm:px-6 lg:px-8">
            <div className="grid flex-1 gap-3" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={slide.label}
                  aria-current={i === index}
                  className="group text-start"
                >
                  <span className={`mb-2 hidden truncate text-xs font-semibold uppercase tracking-wide sm:block ${i === index ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
                    {slide.label}
                  </span>
                  <span className="block h-[3px] overflow-hidden bg-white/25">
                    <span
                      className="block h-full bg-wydad-logo"
                      style={{ width: i === index ? `${progress * 100}%` : i < index ? '100%' : '0%', opacity: i < index ? 0.6 : 1 }}
                    />
                  </span>
                </button>
              ))}
            </div>
            <div className="hidden gap-1.5 sm:flex">
              {arrow(-1)}
              {arrow(1)}
            </div>
          </div>
        </div>
      )}

      {/* Bottom fade to page content */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-20 bg-gradient-to-t from-surface to-transparent" />
    </section>
  );
}
