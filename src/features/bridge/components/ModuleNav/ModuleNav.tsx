import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Panel, Heading, Text, Icon } from '@/components/ui';
import { ROUTES } from '@/app/router/paths';
import { prefetchRoute } from '@/app/router/prefetch';
import { staggerContainer, fadeInUp } from '@/lib/motion/variants';
import styles from './ModuleNav.module.css';

interface Module {
  to: string;
  code: string;
  title: string;
  desc: string;
}

const MODULES: Module[] = [
  {
    to: ROUTES.pilot,
    code: '01',
    title: 'Piloto',
    desc: 'Ficha y credenciales del comandante.',
  },
  { to: ROUTES.systems, code: '02', title: 'Sistemas', desc: 'Tecnologías en órbita.' },
  { to: ROUTES.missions, code: '03', title: 'Misiones', desc: 'Proyectos completados.' },
  { to: ROUTES.logbook, code: '04', title: 'Bitácora', desc: 'Trayectoria de vuelo.' },
  { to: ROUTES.comms, code: '05', title: 'Comms', desc: 'Abre un canal directo.' },
  {
    to: ROUTES.archive,
    code: '06',
    title: 'Archivo',
    desc: 'Registros técnicos desclasificados.',
  },
];

export function ModuleNav() {
  return (
    <motion.ul
      className={styles['module-nav']}
      role="list"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    >
      {MODULES.map((m) => (
        <motion.li key={m.to} variants={fadeInUp}>
          <Link
            to={m.to}
            className={styles['module-nav__link']}
            onMouseEnter={() => prefetchRoute(m.to)}
            onFocus={() => prefetchRoute(m.to)}
          >
            <Panel bracketed className={styles['module-nav__panel']}>
              <Text variant="mono" tone="accent">
                MÓDULO {m.code}
              </Text>
              <Heading level={2} size="md">
                {m.title}
              </Heading>
              <Text variant="caption" tone="muted">
                {m.desc}
              </Text>
              <span className={styles['module-nav__arrow']} aria-hidden="true">
                <Icon name="arrow-right" size={18} />
              </span>
            </Panel>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
