import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react';
import type { Variants } from 'motion/react';
import { useMousePosition } from '@/hooks/useMousePosition';
import { useHasHover } from '@/hooks/useMediaQuery';
import { formatMET } from '@/lib/format';
import styles from './EvaScan.module.css';

/**
 * EVA crew scan: a blueprint-style astronaut whose suit parts anchor the
 * hero telemetry as labelled callouts (antenna -> SIG, PLSS -> ORBIT,
 * wrist console -> MET). Pure decoration; everything is aria-hidden.
 */

/** Stroke-draws a shape, then lets its fill bleed in. */
const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0, fillOpacity: 0 },
  visible: (order: number) => ({
    pathLength: 1,
    opacity: 1,
    fillOpacity: 1,
    transition: {
      pathLength: { delay: 0.5 + order * 0.07, duration: 0.55, ease: 'easeInOut' },
      opacity: { delay: 0.5 + order * 0.07, duration: 0.01 },
      fillOpacity: { delay: 0.95 + order * 0.07, duration: 0.4 },
    },
  }),
};

const appear: Variants = {
  hidden: { opacity: 0 },
  visible: (order: number) => ({
    opacity: 1,
    transition: { delay: 0.5 + order * 0.07, duration: 0.35 },
  }),
};

/* Shared looks. Suit shells share one translucent hull fill so the figure
   reads as a single body over the starfield. */
const shell = {
  fill: 'rgb(18 23 38 / 0.55)',
  stroke: 'rgb(125 239 255 / 0.55)',
  strokeWidth: 1.5,
} as const;

const detail = {
  fill: 'none',
  stroke: 'var(--color-accent)',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
} as const;

const leader = {
  fill: 'none',
  stroke: 'rgb(56 225 255 / 0.4)',
  strokeWidth: 1,
} as const;

interface CalloutProps {
  path: string;
  anchor: [number, number];
  textY: number;
  label: string;
  value: string;
  order: number;
}

function Callout({ path, anchor, textY, label, value, order }: CalloutProps) {
  return (
    <>
      <motion.path d={path} {...leader} variants={draw} custom={order} />
      <motion.circle
        cx={anchor[0]}
        cy={anchor[1]}
        r={2.2}
        fill="var(--color-accent)"
        stroke="none"
        className={styles['eva__anchor']}
        variants={appear}
        custom={order}
      />
      <motion.text
        x={210}
        y={textY}
        className={styles['eva__text']}
        variants={appear}
        custom={order + 1}
      >
        <tspan className={styles['eva__label']}>{label} ─ </tspan>
        <tspan className={styles['eva__value']}>{value}</tspan>
      </motion.text>
    </>
  );
}

/* Soft, distant-body response: the scan lags well behind the cursor. */
const PARALLAX_SPRING = { stiffness: 60, damping: 18, mass: 0.8 };

export function EvaScan() {
  const [met, setMet] = useState(() => formatMET());
  const hasHover = useHasHover();
  const reduceMotion = useReducedMotion();

  const { x, y } = useMousePosition();
  // Counter-movement: a far-away body drifts against the cursor, never with it.
  const parallaxX = useSpring(
    useTransform(x, (v) => -(v / window.innerWidth - 0.5) * 16),
    PARALLAX_SPRING,
  );
  const parallaxY = useSpring(
    useTransform(y, (v) => -(v / window.innerHeight - 0.5) * 12),
    PARALLAX_SPRING,
  );
  const tilt = useSpring(
    useTransform(x, (v) => (v / window.innerWidth - 0.5) * 2),
    PARALLAX_SPRING,
  );

  useEffect(() => {
    const id = setInterval(() => setMet(formatMET()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    /* Parallax lives on an HTML wrapper: on SVG elements, motion maps
       x/y to SVG attributes instead of CSS transforms. */
    <motion.div
      aria-hidden="true"
      style={
        hasHover && !reduceMotion
          ? { x: parallaxX, y: parallaxY, rotate: tilt }
          : undefined
      }
    >
    <motion.svg
      className={styles.eva}
      viewBox="0 0 340 400"
      aria-hidden="true"
      initial="hidden"
      animate="visible"
    >
      <defs>
        <radialGradient id="eva-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(56 225 255 / 0.08)" />
          <stop offset="100%" stopColor="rgb(56 225 255 / 0)" />
        </radialGradient>
        <linearGradient id="eva-visor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(125 239 255 / 0.4)" />
          <stop offset="100%" stopColor="rgb(10 168 204 / 0.08)" />
        </linearGradient>
        <linearGradient id="eva-scanband" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(56 225 255 / 0)" />
          <stop offset="50%" stopColor="rgb(56 225 255 / 0.14)" />
          <stop offset="100%" stopColor="rgb(56 225 255 / 0)" />
        </linearGradient>
      </defs>

      {/* Ambient glow behind the figure */}
      <motion.ellipse
        cx={120}
        cy={185}
        rx={150}
        ry={175}
        fill="url(#eva-glow)"
        variants={appear}
        custom={0}
      />

      {/* Scan reticle corners */}
      <motion.path
        d="M30 14 h-14 v14 M210 14 h14 v14 M30 336 h-14 v-14 M210 336 h14 v-14"
        fill="none"
        stroke="rgb(56 225 255 / 0.3)"
        strokeWidth={1.5}
        variants={appear}
        custom={1}
      />

      {/* Sweeping scan band (CSS loop) */}
      <g className={styles['eva__scan']}>
        <rect x={18} y={0} width={204} height={30} fill="url(#eva-scanband)" />
        <line
          x1={18}
          y1={15}
          x2={222}
          y2={15}
          stroke="rgb(56 225 255 / 0.25)"
          strokeWidth={1}
        />
      </g>

      {/* Everything below drifts together so leader lines never detach */}
      <g className={styles['eva__float']}>
        {/* Tether back to the station (off-canvas) */}
        <motion.path
          d="M82 118 C 46 100, 38 58, 8 26"
          fill="none"
          stroke="rgb(125 239 255 / 0.35)"
          strokeWidth={1.2}
          strokeDasharray="4 7"
          className={styles['eva__tether']}
          variants={draw}
          custom={1}
        />

        {/* ---- Suit: PLSS backpack edges (behind torso) ---- */}
        <motion.rect x={76} y={108} width={14} height={58} rx={6} {...shell} variants={draw} custom={2} />
        <motion.rect x={150} y={108} width={14} height={58} rx={6} {...shell} variants={draw} custom={2} />

        {/* ---- Suit: torso, neck, helmet ---- */}
        <motion.rect x={88} y={104} width={64} height={86} rx={18} {...shell} variants={draw} custom={3} />
        <motion.rect x={106} y={96} width={28} height={10} rx={4} {...shell} variants={draw} custom={4} />
        <motion.circle cx={120} cy={64} r={34} {...shell} variants={draw} custom={5} />
        <motion.ellipse
          cx={120}
          cy={68}
          rx={23}
          ry={17}
          fill="url(#eva-visor)"
          stroke="rgb(125 239 255 / 0.5)"
          strokeWidth={1.2}
          variants={draw}
          custom={6}
        />
        {/* Visor reflection */}
        <motion.path
          d="M107 60 Q 114 51 128 54"
          {...detail}
          strokeWidth={2}
          opacity={0.7}
          variants={appear}
          custom={7}
        />

        {/* ---- Antenna + signal ---- */}
        <motion.line x1={144} y1={40} x2={158} y2={26} {...detail} variants={draw} custom={7} />
        <motion.circle cx={159} cy={25} r={2.4} fill="var(--color-accent)" stroke="none" variants={appear} custom={7} />
        <g className={styles['eva__signal']}>
          <motion.path d="M166 18 a9 9 0 0 1 4 10" {...detail} strokeWidth={1.2} variants={appear} custom={8} />
          <motion.path d="M172 13 a14 14 0 0 1 6 15" {...detail} strokeWidth={1.2} variants={appear} custom={8} />
        </g>

        {/* ---- Chest control panel ---- */}
        <motion.rect x={104} y={124} width={32} height={22} rx={3} {...shell} variants={draw} custom={8} />
        <motion.rect
          x={108}
          y={128}
          width={6}
          height={4}
          fill="var(--color-secondary)"
          stroke="none"
          className={styles['eva__blink']}
          variants={appear}
          custom={9}
        />
        <motion.rect x={117} y={128} width={6} height={4} fill="var(--color-accent)" stroke="none" variants={appear} custom={9} />
        <motion.rect x={126} y={128} width={6} height={4} fill="rgb(56 225 255 / 0.3)" stroke="none" variants={appear} custom={9} />
        <motion.line x1={108} y1={138} x2={132} y2={138} {...detail} strokeWidth={1} opacity={0.5} variants={appear} custom={9} />
        <motion.line x1={108} y1={142} x2={124} y2={142} {...detail} strokeWidth={1} opacity={0.5} variants={appear} custom={9} />

        {/* ---- Left arm: raised, waving ---- */}
        <motion.rect
          x={50} y={107.5} width={46} height={17} rx={8.5}
          transform="rotate(30 94 116)"
          {...shell} variants={draw} custom={10}
        />
        <motion.rect
          x={16} y={85} width={40} height={16} rx={8}
          transform="rotate(55 54 93)"
          {...shell} variants={draw} custom={11}
        />
        <motion.circle cx={32} cy={62} r={10} {...shell} variants={draw} custom={12} />

        {/* ---- Right arm: relaxed, with wrist console ---- */}
        <motion.rect
          x={140} y={110} width={17} height={44} rx={8.5}
          transform="rotate(-12 148 118)"
          {...shell} variants={draw} custom={10}
        />
        <motion.rect
          x={146} y={148} width={16} height={42} rx={8}
          transform="rotate(-20 154 152)"
          {...shell} variants={draw} custom={11}
        />
        <motion.circle cx={168} cy={193} r={9} {...shell} variants={draw} custom={12} />
        <motion.rect
          x={152} y={168} width={15} height={10} rx={2}
          transform="rotate(-20 159 173)"
          fill="rgb(18 23 38 / 0.8)"
          stroke="var(--color-accent)"
          strokeWidth={1.2}
          variants={draw}
          custom={12}
        />

        {/* ---- Hips + legs, drifting pose ---- */}
        <motion.rect x={94} y={186} width={52} height={18} rx={8} {...shell} variants={draw} custom={13} />
        <motion.rect
          x={88} y={200} width={19} height={46} rx={9.5}
          transform="rotate(14 97 204)"
          {...shell} variants={draw} custom={14}
        />
        <motion.rect
          x={78} y={246} width={17} height={44} rx={8.5}
          transform="rotate(26 86 248)"
          {...shell} variants={draw} custom={15}
        />
        <motion.rect
          x={50} y={282} width={30} height={15} rx={6}
          transform="rotate(20 67 288)"
          {...shell} variants={draw} custom={16}
        />
        <motion.rect
          x={132} y={200} width={19} height={44} rx={9.5}
          transform="rotate(-10 141 204)"
          {...shell} variants={draw} custom={14}
        />
        <motion.rect
          x={140} y={245} width={17} height={46} rx={8.5}
          transform="rotate(4 148 247)"
          {...shell} variants={draw} custom={15}
        />
        <motion.rect
          x={133} y={290} width={30} height={15} rx={6}
          transform="rotate(-4 145 295)"
          {...shell} variants={draw} custom={16}
        />

        {/* ---- Telemetry callouts ---- */}
        <Callout
          path="M159 25 L 182 25 L 196 40 L 206 40"
          anchor={[159, 25]}
          textY={44}
          label="SIG"
          value="98.6%"
          order={17}
        />
        <Callout
          path="M164 118 L 188 96 L 206 96"
          anchor={[164, 118]}
          textY={100}
          label="ORBIT"
          value="NOMINAL"
          order={18}
        />
        <Callout
          path="M168 173 L 206 173"
          anchor={[168, 173]}
          textY={177}
          label="MET"
          value={met}
          order={19}
        />
        <Callout
          path="M146 190 L 192 236 L 206 236"
          anchor={[146, 190]}
          textY={240}
          label="CREW"
          value="01"
          order={20}
        />

        {/* Caption */}
        <motion.text
          x={120}
          y={368}
          textAnchor="middle"
          className={styles['eva__caption']}
          variants={appear}
          custom={22}
        >
          EVA-01 · ACTIVIDAD EXTRAVEHICULAR
        </motion.text>
      </g>
    </motion.svg>
    </motion.div>
  );
}
