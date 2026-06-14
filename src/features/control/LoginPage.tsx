import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Field, Heading, Panel, Text } from '@/components/ui';
import { Seo } from '@/lib/seo/Seo';
import { CONTROL } from '@/app/router/paths';
import { useControlAuth } from './ControlAuthProvider';
import styles from './LoginPage.module.css';

/** Authentication gate for the control center — diegetic "command access". */
export default function LoginPage() {
  const { status, login } = useControlAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  // Already authenticated: skip the gate.
  if (status === 'authed') return <Navigate to={CONTROL.root} replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setError('Introduce la clave de comando.');
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      await login(password);
      navigate(CONTROL.root, { replace: true });
    } catch {
      setError('Credenciales rechazadas. Acceso denegado.');
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.login}>
      <Seo
        title="Centro de Control · BG-01"
        description="Acceso restringido a la consola de mando de la estación."
        noindex
      />

      <Panel elevation="drawer" bracketed className={styles.login__panel}>
        <p className={styles.login__eyebrow}>ACCESO RESTRINGIDO · BG-01</p>
        <Heading level={1} size="lg">
          Centro de Control
        </Heading>
        <Text tone="muted">
          Autenticación de comandante requerida para operar los sistemas de la estación.
        </Text>

        <form className={styles.login__form} onSubmit={handleSubmit} noValidate>
          <Field
            label="Clave de comando"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            error={error}
            required
          />
          <Button type="submit" icon="signal" loading={submitting}>
            Autorizar acceso
          </Button>
        </form>
      </Panel>
    </div>
  );
}
