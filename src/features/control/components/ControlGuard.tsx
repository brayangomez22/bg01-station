import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { Icon } from '@/components/ui';
import { ROUTES, CONTROL } from '@/app/router/paths';
import { useControlAuth } from '../ControlAuthProvider';
import styles from './ControlGuard.module.css';

/** Modules the control center will administer (editors arrive in later slices). */
const MODULES = [
  { label: 'Piloto', hint: 'Perfil' },
  { label: 'Sistemas', hint: 'Tecnologías' },
  { label: 'Misiones', hint: 'Proyectos' },
  { label: 'Bitácora', hint: 'Experiencia' },
  { label: 'Archivo', hint: 'Registros' },
  { label: 'Frecuencias', hint: 'Contacto' },
  { label: 'Textos', hint: 'Copy editable' },
] as const;

/**
 * Gate for the authenticated control area. While the session is being checked
 * it holds; unauthenticated visitors are routed to login; authenticated ones
 * get the command rail + content outlet.
 */
export function ControlGuard() {
  const { status, logout } = useControlAuth();

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
    <div className={styles.guard}>
      <aside className={styles.guard__rail}>
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
          {MODULES.map((m) => (
            <span key={m.label} className={styles['guard__link--pending']} aria-disabled="true">
              {m.label}
              <small>{m.hint}</small>
            </span>
          ))}
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
