import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui';
import { ROUTES, CONTROL } from '@/app/router/paths';
import { useControlAuth } from '../ControlAuthProvider';
import styles from './ControlGuard.module.css';

/** Modules with a live editor (route) vs. those still pending. */
const MODULES: { label: string; hint: string; route?: string }[] = [
  { label: 'Piloto', hint: 'Perfil', route: CONTROL.pilot },
  { label: 'Sistemas', hint: 'Tecnologías', route: CONTROL.technologies },
  { label: 'Misiones', hint: 'Proyectos', route: CONTROL.missions },
  { label: 'Bitácora', hint: 'Experiencia', route: CONTROL.experiences },
  { label: 'Archivo', hint: 'Registros', route: CONTROL.archive },
  { label: 'Frecuencias', hint: 'Contacto', route: CONTROL.frequencies },
  { label: 'Textos', hint: 'Copy editable', route: CONTROL.siteCopy },
];

/**
 * Gate for the authenticated control area. While the session is being checked
 * it holds; unauthenticated visitors are routed to login; authenticated ones
 * get the command rail + content outlet.
 */
export function ControlGuard() {
  const { status, logout } = useControlAuth();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes (link tapped).
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  // While the drawer is open, lock body scroll and allow Escape to close it.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [navOpen]);

  if (status === 'checking') {
    return (
      <div className={styles['guard__checking']}>
        <span className={styles['guard__pulse']} aria-hidden="true" />
        Verificando credenciales…
      </div>
    );
  }

  if (status === 'anon') {
    return <Navigate to={CONTROL.login} replace />;
  }

  return (
    <div className={styles.guard} data-nav-open={navOpen}>
      <header className={styles.guard__topbar}>
        <button
          type="button"
          className={styles['guard__toggle']}
          aria-label={navOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={navOpen}
          aria-controls="control-rail"
          onClick={() => setNavOpen((open) => !open)}
        >
          <Icon name={navOpen ? 'close' : 'menu'} size={20} />
        </button>
        <span className={styles['guard__topbar-code']}>BG-01</span>
        <span className={styles['guard__topbar-name']}>Centro de Control</span>
      </header>

      {navOpen && (
        <button
          type="button"
          className={styles.guard__backdrop}
          aria-label="Cerrar menú"
          onClick={() => setNavOpen(false)}
        />
      )}

      <aside id="control-rail" className={styles.guard__rail}>
        <div className={styles.guard__brand}>
          <span className={styles['guard__brand-code']}>BG-01</span>
          <span className={styles['guard__brand-name']}>Centro de Control</span>
        </div>

        <nav className={styles.guard__nav} aria-label="Módulos del centro de control">
          <NavLink
            to={CONTROL.root}
            end
            className={({ isActive }) =>
              isActive ? `${styles.guard__link} ${styles['guard__link--active']}` : styles.guard__link
            }
          >
            <Icon name="signal" size={16} />
            Resumen
          </NavLink>

          <p className={styles['guard__nav-label']}>Módulos</p>
          {MODULES.map((m) =>
            m.route ? (
              <NavLink
                key={m.label}
                to={m.route}
                className={({ isActive }) =>
                  isActive
                    ? `${styles.guard__link} ${styles['guard__link--active']}`
                    : styles.guard__link
                }
              >
                {m.label}
                <small>{m.hint}</small>
              </NavLink>
            ) : (
              <span
                key={m.label}
                className={styles['guard__link--pending']}
                aria-disabled="true"
              >
                {m.label}
                <small>{m.hint}</small>
              </span>
            ),
          )}
        </nav>

        <div className={styles.guard__footer}>
          <a className={styles.guard__exit} href={ROUTES.bridge}>
            <Icon name="arrow-left" size={14} />
            Volver a la estación
          </a>
          <button type="button" className={styles.guard__logout} onClick={() => void logout()}>
            <Icon name="close" size={14} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className={styles.guard__content}>
        <Outlet />
      </main>
    </div>
  );
}
