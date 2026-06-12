import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/app/router/paths';
import { DECKS } from '@/app/router/decks';
import { prefetchRoute } from '@/app/router/prefetch';
import { useSound } from '@/app/providers/SoundProvider';
import { cn } from '@/lib/cn';
import styles from './NavDock.module.css';

/** Persistent console-style primary navigation with hover/focus prefetch. */
export function NavDock() {
  const { play } = useSound();
  return (
    <nav className={styles['nav-dock']} aria-label="Navegación principal">
      <ul className={styles['nav-dock__list']} role="list">
        {DECKS.map((entry) => (
          <li key={entry.route} className={styles['nav-dock__item']}>
            <NavLink
              to={entry.route}
              end={entry.route === ROUTES.bridge}
              title={entry.hint}
              aria-label={`${entry.name} — ${entry.hint}`}
              onMouseEnter={() => {
                prefetchRoute(entry.route);
                play('blip');
              }}
              onFocus={() => prefetchRoute(entry.route)}
              className={({ isActive }) =>
                cn(styles['nav-dock__link'], isActive && styles['nav-dock__link--active'])
              }
            >
              <span className={styles['nav-dock__code']} aria-hidden="true">
                {entry.code}
              </span>
              <span className={styles['nav-dock__label']}>{entry.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
