import { useEffect, useMemo, useState } from 'react';
import { useStationShift, type StationShift } from '@/hooks/useStationShift';
import styles from './AmbientStatus.module.css';

/**
 * Ambient operations line: the current shift plus a rotating background
 * micro-event ("rotación de paneles solares completa"). Pure atmosphere —
 * nothing here is actionable, so the whole element is hidden from screen
 * readers and from narrow viewports.
 */

const SHIFT_LABEL: Record<StationShift, string> = {
  alfa: 'TURNO ALFA',
  beta: 'TURNO BETA',
  nocturno: 'TURNO NOCTURNO',
};

const GENERIC_EVENTS = [
  'enlace de datos estable',
  'rotación de paneles solares completa',
  'presión de cabina nominal',
  'antena de alta ganancia alineada',
  'reciclado de aire al 98%',
  'telemetría sincronizada con tierra',
  'giroscopios dentro de tolerancia',
  'integridad del casco verificada',
];

const SHIFT_EVENTS: Record<StationShift, string[]> = {
  alfa: ['diagnóstico matutino completado', 'plan de órbita actualizado'],
  beta: ['ventana de comunicaciones abierta', 'baterías a carga completa'],
  nocturno: [
    'iluminación reducida en cubiertas',
    'sensores en guardia pasiva',
    'tripulación mínima en cubierta',
  ],
};

const ROTATE_MS = 45_000;

export function AmbientStatus() {
  const shift = useStationShift();
  const events = useMemo(
    () => [...SHIFT_EVENTS[shift], ...GENERIC_EVENTS],
    [shift],
  );

  // Hour-seeded start so the first line varies between visits.
  const [index, setIndex] = useState(() => new Date().getHours());

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => i + 1), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.ambient} aria-hidden="true">
      <span className={styles.ambient__shift}>{SHIFT_LABEL[shift]}</span>
      <span className={styles.ambient__sep}>·</span>
      {/* Keyed by index: the entry animation re-runs on every rotation. */}
      <span key={index} className={styles.ambient__event}>
        {events[index % events.length]}
      </span>
    </div>
  );
}
