import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DECKS, deckOf, type Deck } from '@/app/router/decks';
import { useSound } from '@/app/providers/SoundProvider';
import { cn } from '@/lib/cn';
import styles from './StationMap.module.css';

/** Anyone (HUD button, console) can open the schematic via this event. */
export const OPEN_MAP_EVENT = 'bg01:map';

/**
 * Station schematic — a blueprint cross-section of BG-01 with the seven
 * decks stacked top-to-bottom, matching the vertical travel of the route
 * transitions. The SVG is mouse candy (aria-hidden); the legend list is
 * the accessible navigation path.
 */
export function StationMap() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { play } = useSound();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const current = deckOf(pathname);

  const close = useCallback(() => {
    setOpen(false);
    setHovered(null);
  }, []);

  useEffect(() => {
    const onOpen = () => {
      play('select');
      setOpen(true);
    };
    window.addEventListener(OPEN_MAP_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_MAP_EVENT, onOpen);
  }, [play]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const select = (deck: Deck) => {
    play('select');
    close();
    if (deck.index !== current.index) navigate(deck.route);
  };

  const hoverProps = (deck: Deck) => ({
    onMouseEnter: () => {
      if (hovered !== deck.index) play('blip');
      setHovered(deck.index);
    },
    onMouseLeave: () => setHovered(null),
  });

  /** Wraps one deck's shapes with interaction + state attributes. Called as
      a plain function (not a component) so groups never remount on hover. */
  const renderDeck = (deck: Deck, children: ReactNode) => (
    <g
      className={styles.deck}
      style={{ ['--i' as string]: deck.index }}
      data-active={deck.index === current.index || undefined}
      data-hover={hovered === deck.index || undefined}
      onClick={() => select(deck)}
      {...hoverProps(deck)}
    >
      {children}
    </g>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.map}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={close}
        >
          <motion.div
            className={styles.map__panel}
            role="dialog"
            aria-modal="true"
            aria-label="Esquemático de la estación BG-01"
            initial={{ y: 10, scale: 0.99 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.map__header}>
              <p className={styles.map__title}>
                ESQUEMÁTICO · BG-01
                <span className={styles.map__subtitle}> corte transversal</span>
              </p>
              <button
                ref={closeRef}
                type="button"
                className={styles.map__close}
                onClick={close}
              >
                [ CERRAR <kbd className={styles.map__kbd}>ESC</kbd> ]
              </button>
            </header>

            <div className={styles.map__body}>
              {/* ---- Blueprint cross-section (decorative; legend is the
                     accessible path) ---- */}
              <svg
                className={styles.map__svg}
                viewBox="0 0 360 700"
                aria-hidden="true"
                focusable="false"
              >
                {/* Spine + mast + thruster: the station's non-navigable bones */}
                <g className={styles.frame}>
                  <line x1="180" y1="34" x2="180" y2="648" className={styles.spine} />
                  {/* Antenna mast */}
                  <line x1="180" y1="12" x2="180" y2="38" />
                  <circle cx="180" cy="10" r="2.5" />
                  <line x1="172" y1="20" x2="188" y2="20" />
                  {/* Inter-deck collars */}
                  {[104, 184, 274, 316, 406, 486, 566].map((y) => (
                    <rect key={y} x="170" y={y} width="20" height="10" rx="2" />
                  ))}
                  {/* Solar array truss between decks 02 and 03 */}
                  <line x1="28" y1="300" x2="332" y2="300" />
                  <rect x="168" y="288" width="24" height="24" rx="3" />
                  <g className={styles.panelGrid}>
                    <rect x="28" y="284" width="92" height="32" />
                    <line x1="59" y1="284" x2="59" y2="316" />
                    <line x1="89" y1="284" x2="89" y2="316" />
                    <rect x="240" y="284" width="92" height="32" />
                    <line x1="271" y1="284" x2="271" y2="316" />
                    <line x1="301" y1="284" x2="301" y2="316" />
                  </g>
                  {/* Thruster bell */}
                  <path d="M 164 648 L 152 678 Q 180 692 208 678 L 196 648 Z" />
                  <path d="M 160 682 Q 180 690 200 682" fill="none" />
                </g>

                {/* 00 PUENTE — command dome */}
                {renderDeck(DECKS[0], <>
                  <path
                    className={styles.hull}
                    d="M 138 104 L 138 76 Q 138 38 180 38 Q 222 38 222 76 L 222 104 Z"
                  />
                  <rect className={styles.detail} x="152" y="60" width="56" height="12" rx="6" />
                  <line className={styles.detail} x1="170" y1="60" x2="170" y2="72" />
                  <line className={styles.detail} x1="190" y1="60" x2="190" y2="72" />
                  <line className={styles.leader} x1="222" y1="71" x2="262" y2="71" />
                  <text className={styles.code} x="268" y="75">00</text>
                </>)}

                {/* 01 PILOTO — crew capsule */}
                {renderDeck(DECKS[1], <>
                  <rect className={styles.hull} x="132" y="114" width="96" height="70" rx="14" />
                  <circle className={styles.detail} cx="180" cy="149" r="16" />
                  <circle className={styles.detail} cx="180" cy="149" r="9" />
                  <line className={styles.leader} x1="132" y1="149" x2="96" y2="149" />
                  <text className={cn(styles.code, styles.codeEnd)} x="90" y="153">01</text>
                </>)}

                {/* 02 SISTEMAS — engineering block with radiator fins */}
                {renderDeck(DECKS[2], <>
                  <path
                    className={styles.hull}
                    d="M 130 194 L 230 194 L 242 206 L 242 262 L 230 274 L 130 274 L 118 262 L 118 206 Z"
                  />
                  {[210, 230, 250].map((y) => (
                    <g key={y}>
                      <line className={styles.detail} x1="118" y1={y} x2="92" y2={y} />
                      <line className={styles.detail} x1="242" y1={y} x2="268" y2={y} />
                    </g>
                  ))}
                  <circle className={styles.detail} cx="180" cy="234" r="14" />
                  <line className={styles.detail} x1="150" y1="194" x2="150" y2="274" />
                  <line className={styles.detail} x1="210" y1="194" x2="210" y2="274" />
                  <line className={styles.leader} x1="268" y1="230" x2="296" y2="230" />
                  <text className={styles.code} x="302" y="234">02</text>
                </>)}

                {/* 03 MISIONES — hangar bay */}
                {renderDeck(DECKS[3], <>
                  <rect className={styles.hull} x="120" y="326" width="120" height="80" rx="6" />
                  <rect className={styles.detail} x="150" y="346" width="60" height="40" rx="2" />
                  <line className={styles.detail} x1="180" y1="346" x2="180" y2="386" />
                  <circle className={styles.detail} cx="226" cy="340" r="2.5" />
                  <circle className={styles.detail} cx="226" cy="350" r="2.5" />
                  <line className={styles.leader} x1="120" y1="366" x2="88" y2="366" />
                  <text className={cn(styles.code, styles.codeEnd)} x="82" y="370">03</text>
                </>)}

                {/* 04 BITÁCORA — stacked data bands */}
                {renderDeck(DECKS[4], <>
                  <rect className={styles.hull} x="134" y="416" width="92" height="70" rx="6" />
                  {[428, 444, 460].map((y) => (
                    <rect key={y} className={styles.detail} x="146" y={y} width="68" height="8" rx="2" />
                  ))}
                  <line className={styles.leader} x1="226" y1="451" x2="262" y2="451" />
                  <text className={styles.code} x="268" y="455">04</text>
                </>)}

                {/* 05 COMMS — trunk + high-gain dish */}
                {renderDeck(DECKS[5], <>
                  <rect className={styles.hull} x="142" y="496" width="76" height="70" rx="6" />
                  <line className={styles.detail} x1="218" y1="531" x2="244" y2="531" />
                  <path className={styles.detail} d="M 246 506 Q 272 531 246 556" />
                  <line className={styles.detail} x1="246" y1="506" x2="246" y2="556" />
                  <line className={styles.detail} x1="160" y1="496" x2="160" y2="482" />
                  <circle className={styles.detail} cx="160" cy="480" r="2" />
                  <line className={styles.leader} x1="142" y1="531" x2="104" y2="531" />
                  <text className={cn(styles.code, styles.codeEnd)} x="98" y="535">05</text>
                </>)}

                {/* 06 ARCHIVO — storage crates */}
                {renderDeck(DECKS[6], <>
                  <rect className={styles.hull} x="136" y="576" width="88" height="64" rx="4" />
                  <line className={styles.detail} x1="165" y1="576" x2="165" y2="640" />
                  <line className={styles.detail} x1="195" y1="576" x2="195" y2="640" />
                  <line className={styles.detail} x1="136" y1="608" x2="224" y2="608" />
                  <line className={styles.leader} x1="224" y1="608" x2="262" y2="608" />
                  <text className={styles.code} x="268" y="612">06</text>
                </>)}
              </svg>

              {/* ---- Deck legend (the accessible navigation) ---- */}
              <aside className={styles.map__legend}>
                <p className={styles.map__eyebrow}>CUBIERTAS</p>
                <ul className={styles.map__list} role="list">
                  {DECKS.map((deck) => (
                    <li key={deck.route}>
                      <button
                        type="button"
                        className={cn(
                          styles.map__item,
                          deck.index === current.index && styles['map__item--active'],
                          hovered === deck.index && styles['map__item--hover'],
                        )}
                        onClick={() => select(deck)}
                        {...hoverProps(deck)}
                      >
                        <span className={styles.map__itemCode} aria-hidden="true">
                          {deck.code}
                        </span>
                        <span className={styles.map__itemName}>{deck.name}</span>
                        <span className={styles.map__itemHint}>
                          {deck.index === current.index ? '◉ actual' : deck.hint}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className={styles.map__position}>
                  POSICIÓN — DECK {current.code} · {current.name.toUpperCase()}
                </p>
              </aside>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
