import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Text } from '@/components/ui';
import { useSound } from '@/app/providers/SoundProvider';
import { useHydrated } from '@/hooks/useHydrated';
import type { MediaRef } from '@/types/common';
import styles from './MissionGallery.module.css';

const capCode = (i: number) => `CAP-${String(i + 1).padStart(2, '0')}`;

interface MissionGalleryProps {
  /** Mission code, used to label the viewer ("M-007 · CAP-02"). */
  code: string;
  images: MediaRef[];
}

/**
 * Visual log of a mission: real captures of the product, shown as numbered
 * thumbnails that open a full-size viewer (arrows to move, Esc to close,
 * focus returns to the thumbnail that opened it).
 */
export function MissionGallery({ code, images }: MissionGalleryProps) {
  const { play } = useSound();
  const hydrated = useHydrated();
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openerRef = useRef<number | null>(null);

  const open = (i: number) => {
    play('select');
    openerRef.current = i;
    setActive(i);
  };

  const close = useCallback(() => {
    setActive(null);
    const opener = openerRef.current;
    if (opener !== null) thumbRefs.current[opener]?.focus();
  }, []);

  const step = useCallback(
    (delta: number) => {
      play('blip');
      setActive((i) => (i === null ? i : (i + delta + images.length) % images.length));
    },
    [images.length, play],
  );

  const isOpen = active !== null;

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close, step]);

  const current = active === null ? null : images[active];

  return (
    <section className={styles.gallery} aria-label="Registro visual">
      <Text variant="mono" tone="accent">
        ▸ REGISTRO VISUAL · {images.length} {images.length === 1 ? 'CAPTURA' : 'CAPTURAS'}
      </Text>

      <ul role="list" className={styles.gallery__grid}>
        {images.map((img, i) => (
          <li key={img.src}>
            <figure className={styles.gallery__item}>
              <button
                ref={(el) => {
                  thumbRefs.current[i] = el;
                }}
                type="button"
                className={styles.gallery__thumb}
                onClick={() => open(i)}
                aria-label={`Ampliar ${capCode(i)}: ${img.alt}`}
              >
                <img
                  src={img.src}
                  alt=""
                  width={img.width}
                  height={img.height}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <figcaption className={styles.gallery__caption}>
                <span className={styles.gallery__code}>{capCode(i)}</span>
                {img.alt}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {/* Portaled to <body>: the briefing sits inside transformed ancestors
          (reveal, route transition) that would trap position: fixed. Gated
          on hydration: document.body doesn't exist in the prerender. */}
      {hydrated &&
        createPortal(
          <AnimatePresence>
            {current && active !== null && (
              <motion.div
                className={styles.viewer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={close}
              >
                <motion.div
                  className={styles.viewer__panel}
                  role="dialog"
                  aria-modal="true"
                  aria-label={`${code} · ${capCode(active)}: ${current.alt}`}
                  initial={{ y: 10, scale: 0.99 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <header className={styles.viewer__header}>
                    <p className={styles.viewer__title}>
                      {code} · {capCode(active)}
                      <span className={styles.viewer__count}>
                        {' '}
                        {active + 1} / {images.length}
                      </span>
                    </p>
                    <button
                      ref={closeRef}
                      type="button"
                      className={styles.viewer__button}
                      onClick={close}
                    >
                      [ CERRAR <kbd className={styles.viewer__kbd}>ESC</kbd> ]
                    </button>
                  </header>

                  <div className={styles.viewer__body}>
                    <img
                      className={styles.viewer__image}
                      src={current.src}
                      alt={current.alt}
                      width={current.width}
                      height={current.height}
                    />
                  </div>

                  <footer className={styles.viewer__footer}>
                    <p className={styles.viewer__caption}>{current.alt}</p>
                    {images.length > 1 && (
                      <div className={styles.viewer__nav}>
                        <button
                          type="button"
                          className={styles.viewer__button}
                          onClick={() => step(-1)}
                        >
                          [ ← ANTERIOR ]
                        </button>
                        <button
                          type="button"
                          className={styles.viewer__button}
                          onClick={() => step(1)}
                        >
                          [ SIGUIENTE → ]
                        </button>
                      </div>
                    )}
                  </footer>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}
