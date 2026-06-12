import { useEffect, useState, type FormEvent } from 'react';
import { Panel, Field, Button, Text } from '@/components/ui';
import { useSound } from '@/app/providers/SoundProvider';
import { useTransmission } from '../../hooks/useTransmission';
import styles from './TransmissionForm.module.css';

export function TransmissionForm() {
  const { state, errors, send, reset } = useTransmission();
  const { play } = useSound();

  // Diegetic acknowledgments: static while the signal travels, a two-tone
  // confirm when the station receives it.
  useEffect(() => {
    if (state === 'in-transit') play('static');
    if (state === 'success') play('confirm');
  }, [state, play]);
  const [from, setFrom] = useState('');
  const [frequency, setFrequency] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const transmitting = state === 'transmitting' || state === 'in-transit';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send({ from, frequency, message, honeypot });
  };

  if (state === 'success') {
    return (
      <Panel bracketed className={styles['transmission-form__success']}>
        <Text variant="mono" tone="accent">
          ✓ MENSAJE RECIBIDO
        </Text>
        <Text>
          Tu transmisión llegó a la estación BG-01. Responderé en cuanto vuelva al puente
          de mando.
        </Text>
        <Button
          variant="ghost"
          onClick={() => {
            setFrom('');
            setFrequency('');
            setMessage('');
            reset();
          }}
        >
          Nueva transmisión
        </Button>
      </Panel>
    );
  }

  return (
    <Panel bracketed>
      <form className={styles['transmission-form']} onSubmit={onSubmit} noValidate>
        <Text variant="mono" tone="accent">
          ▸ TRANSMITIR MENSAJE
        </Text>

        <Field
          label="De"
          name="from"
          value={from}
          onChange={setFrom}
          required
          placeholder="Tu nombre o identificador"
          autoComplete="name"
          error={errors.from}
        />
        <Field
          label="Frecuencia"
          name="frequency"
          type="email"
          value={frequency}
          onChange={setFrequency}
          required
          placeholder="tu@email.com"
          autoComplete="email"
          error={errors.frequency}
        />
        <Field
          as="textarea"
          label="Mensaje"
          name="message"
          value={message}
          onChange={setMessage}
          required
          rows={5}
          placeholder="Escribe tu mensaje a la estación…"
          error={errors.message}
        />

        {/* Honeypot — hidden from users, visible to bots */}
        <div className={styles['transmission-form__honeypot']} aria-hidden="true">
          <label htmlFor="company">No rellenar</label>
          <input
            id="company"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={transmitting}
          iconRight="arrow-right"
        >
          {transmitting ? 'Transmitiendo' : 'Transmitir'}
        </Button>

        <Text variant="mono" tone="muted" aria-live="polite">
          {state === 'transmitting'
            ? '> enviando paquete de datos…'
            : state === 'in-transit'
              ? '> señal en tránsito · distancia 384.400 km · retardo 1.28 s'
              : state === 'error'
                ? '> error: reintenta la transmisión'
                : '> estado: esperando transmisión'}
        </Text>
      </form>
    </Panel>
  );
}
