import { motion, useReducedMotion } from 'motion/react';
import styles from './UplinkConfirm.module.css';

/**
 * Uplink confirmation: a diegetic "signal received" beat for the comms
 * success state. A glowing pulse rides the plotted trajectory from BG-01 to
 * the distant receiver; on arrival, radar rings acknowledge the handshake.
 *
 * Pure decoration — aria-hidden. Under reduced motion it renders the final,
 * settled frame (link drawn, receiver acquired) with no travel or sweep.
 *
 * Timings live on each node's own `transition` prop (not in shared variants):
 * the app's MotionConfig sets a 0.3s default transition, and only an explicit
 * per-element `transition` reliably overrides it for these custom durations.
 */

const TRAJECTORY = 'M30 90 Q 140 16 252 42';
// Transmitter / receiver coordinates — one source so nodes, rings and
// labels stay in agreement.
const TX = { x: 30, y: 90 };
const RX = { x: 252, y: 42 };
const ARRIVAL = 0.95; // s — when the pulse reaches the receiver

// Mechanical curve, mirrors --ease-mechanical / transitions.warp.
const MECHANICAL: [number, number, number, number] = [0.4, 0, 0.2, 1];

export function UplinkConfirm() {
  const reduceMotion = useReducedMotion();

  return (
    <svg className={styles.uplink} viewBox="0 0 282 116" aria-hidden="true">
      {/* Established channel — the link is already open underneath. */}
      <path className={styles['uplink__channel']} d={TRAJECTORY} />

      {/* Transmitter (BG-01) with a one-shot emit ring at launch. */}
      {!reduceMotion && (
        <motion.circle
          className={styles['uplink__emit']}
          cx={TX.x}
          cy={TX.y}
          r={6}
          initial={{ scale: 0.5, opacity: 0.7 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      )}
      <circle className={styles['uplink__node']} cx={TX.x} cy={TX.y} r={4} />
      <circle className={styles['uplink__core']} cx={TX.x} cy={TX.y} r={1.8} />
      <motion.text
        className={styles['uplink__label']}
        x={TX.x}
        y={TX.y + 16}
        textAnchor="middle"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduceMotion ? 0 : 0.1, duration: reduceMotion ? 0 : 0.3 }}
      >
        BG-01
      </motion.text>

      {/* The travelling signal: a 5% segment carried end to end by pathOffset. */}
      {!reduceMotion && (
        <motion.path
          className={styles['uplink__pulse']}
          d={TRAJECTORY}
          initial={{ pathLength: 0.05, pathOffset: 0, opacity: 0 }}
          animate={{ pathLength: 0.05, pathOffset: 0.95, opacity: [0, 1, 1, 0] }}
          transition={{
            pathOffset: { duration: ARRIVAL, ease: MECHANICAL },
            opacity: { duration: ARRIVAL, times: [0, 0.08, 0.82, 1] },
          }}
        />
      )}

      {/* Receiver — radar acknowledgment expands on arrival. */}
      {!reduceMotion &&
        [0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            className={styles['uplink__ring']}
            cx={RX.x}
            cy={RX.y}
            r={22}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: [0.55, 0] }}
            transition={{ delay: ARRIVAL + i * 0.18, duration: 1, ease: 'easeOut' }}
          />
        ))}
      <circle className={styles['uplink__node']} cx={RX.x} cy={RX.y} r={4} />
      <motion.circle
        className={styles['uplink__core']}
        cx={RX.x}
        cy={RX.y}
        r={2}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          reduceMotion ? { duration: 0 } : { delay: ARRIVAL - 0.05, duration: 0.35, ease: 'easeOut' }
        }
      />
      <motion.text
        className={styles['uplink__label']}
        x={RX.x}
        y={RX.y - 12}
        textAnchor="middle"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduceMotion ? 0 : ARRIVAL, duration: reduceMotion ? 0 : 0.3 }}
      >
        Destino
      </motion.text>

      <motion.text
        className={styles['uplink__caption']}
        x={141}
        y={110}
        textAnchor="middle"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduceMotion ? 0 : ARRIVAL + 0.1, duration: reduceMotion ? 0 : 0.3 }}
      >
        Enlace confirmado · 384.400 km
      </motion.text>
    </svg>
  );
}
