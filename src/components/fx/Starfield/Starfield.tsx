import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import styles from './Starfield.module.css';

interface Star {
  x: number;
  y: number;
  z: number; // depth -> parallax + size
  twinkle: number;
}

interface StarfieldProps {
  /** Star density per 10k px². Lowered automatically on small screens. */
  density?: number;
}

/** Mouse parallax amplitude in px at z=1. */
const PARALLAX_PX = 12;
/** Scroll parallax factor at z=1. */
const SCROLL_FACTOR = 0.05;
/** Scroll velocity (px/frame) beyond which stars streak into impulse lines. */
const IMPULSE_THRESHOLD = 38;

/**
 * Canvas2D starfield with real depth: per-star z drives twinkle, mouse
 * parallax, scroll parallax and impulse streaks under fast scrolling.
 * A shooting star crosses every 40–90s as a reward for lingering.
 * - Single rAF; pauses when the tab is hidden.
 * - Renders one static frame under reduced-motion (no listeners attached).
 */
export function Starfield({ density = 0.9 }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let stars: Star[] = [];
    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Pointer parallax state (normalized -1..1, smoothed per frame).
    let targetPX = 0;
    let targetPY = 0;
    let px = 0;
    let py = 0;

    // Scroll state.
    let lastScrollY = window.scrollY;
    let scrollVel = 0;

    // Shooting star state.
    let meteor: { x: number; y: number; vx: number; vy: number; life: number } | null =
      null;
    let nextMeteorAt = performance.now() + (40 + Math.random() * 50) * 1000;

    // Seeded dimensions. draw() must use these — never live window reads —
    // or a buffer/viewport mismatch leaves uncleared strips that smear.
    let w = 0;
    let h = 0;

    const seed = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(((w * h) / 10000) * density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      // Smooth pointer toward target (spring-ish lerp, frame-rate tolerant).
      px += (targetPX - px) * 0.06;
      py += (targetPY - py) * 0.06;

      // Scroll velocity decays so impulse streaks relax after the gesture.
      const sy = window.scrollY;
      scrollVel = scrollVel * 0.82 + (sy - lastScrollY) * 0.18;
      lastScrollY = sy;
      const impulse = !reduced && Math.abs(scrollVel) > IMPULSE_THRESHOLD;

      for (const s of stars) {
        const flicker = reduced ? 1 : 0.6 + 0.4 * Math.sin(t * 0.001 + s.twinkle);
        const size = s.z * 1.6;
        const drawX = s.x + px * PARALLAX_PX * s.z;
        const scrolled = s.y - sy * SCROLL_FACTOR * s.z;
        const drawY = (((scrolled % h) + h) % h) + py * PARALLAX_PX * s.z;

        ctx.globalAlpha = s.z * flicker;
        ctx.fillStyle = s.z > 0.85 ? '#7defff' : '#e8ecf4';

        if (impulse) {
          // Stars elongate along the travel direction: the station moves with you.
          const len = Math.min(Math.abs(scrollVel) * s.z * 0.35, 26);
          ctx.fillRect(drawX - size / 2, drawY, size, len * Math.sign(scrollVel) || 1);
        } else {
          ctx.beginPath();
          ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
          ctx.fill();
        }

        if (!reduced) {
          s.y += s.z * 0.06; // slow drift
          if (s.y > h) s.y = 0;
        }
      }

      // Shooting star: one thin streak, then silence again.
      if (!reduced) {
        if (!meteor && t > nextMeteorAt) {
          const fromLeft = Math.random() > 0.5;
          meteor = {
            x: fromLeft ? -40 : w + 40,
            y: Math.random() * h * 0.4 + 20,
            vx: (fromLeft ? 1 : -1) * (9 + Math.random() * 4),
            vy: 2.4 + Math.random() * 1.6,
            life: 1,
          };
        }
        if (meteor) {
          meteor.x += meteor.vx;
          meteor.y += meteor.vy;
          meteor.life -= 0.012;
          ctx.globalAlpha = Math.max(meteor.life, 0) * 0.9;
          ctx.strokeStyle = '#7defff';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(meteor.x, meteor.y);
          ctx.lineTo(meteor.x - meteor.vx * 6, meteor.y - meteor.vy * 6);
          ctx.stroke();
          if (meteor.life <= 0 || meteor.x < -80 || meteor.x > w + 80) {
            meteor = null;
            nextMeteorAt = t + (40 + Math.random() * 50) * 1000;
          }
        }
      }

      ctx.globalAlpha = 1;
      if (running && !reduced) raf = requestAnimationFrame(draw);
    };

    seed();
    draw(performance.now());

    const onResize = () => seed();
    const onVisibility = () => {
      running = !document.hidden;
      if (running && !reduced) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    };
    const onPointer = (e: PointerEvent) => {
      targetPX = (e.clientX / window.innerWidth) * 2 - 1;
      targetPY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [density, reduced]);

  return <canvas ref={canvasRef} className={styles.starfield} aria-hidden="true" />;
}
