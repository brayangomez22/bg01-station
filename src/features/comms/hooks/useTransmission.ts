import { useCallback, useState } from 'react';
import type { TransmissionPayload, TransmissionState } from '@/types/domain';
import { deliverTransmission } from '@/lib/comms/web3forms';

export interface TransmissionErrors {
  from?: string;
  frequency?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(payload: TransmissionPayload): TransmissionErrors {
  const errors: TransmissionErrors = {};
  if (!payload.from.trim()) errors.from = 'Identifícate antes de transmitir.';
  if (!EMAIL_RE.test(payload.frequency))
    errors.frequency = 'Frecuencia (email) no válida.';
  if (payload.message.trim().length < 10)
    errors.message = 'El mensaje debe tener al menos 10 caracteres.';
  return errors;
}

/**
 * Transmission state machine: idle -> validating -> transmitting -> success|error.
 * Delivery is handled by Web3Forms (see `@/lib/comms/web3forms`).
 */
export function useTransmission() {
  const [state, setState] = useState<TransmissionState>('idle');
  const [errors, setErrors] = useState<TransmissionErrors>({});

  const send = useCallback(async (payload: TransmissionPayload) => {
    // Honeypot: silently succeed to waste bots' time.
    if (payload.honeypot) {
      setState('success');
      return;
    }

    setState('validating');
    const found = validate(payload);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setState('idle');
      return;
    }

    setState('transmitting');
    try {
      const startedAt = performance.now();
      await deliverTransmission(payload);

      // Light-delay theater: the signal "travels" for the remainder of a
      // 1.28s lunar round-trip. Never adds delay the network already spent,
      // but always shows the in-transit beat long enough to read it.
      setState('in-transit');
      const elapsed = performance.now() - startedAt;
      const transit = Math.max(1280 - elapsed, 400);
      await new Promise((resolve) => setTimeout(resolve, transit));

      setState('success');
    } catch {
      setState('error');
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setErrors({});
  }, []);

  return { state, errors, send, reset };
}
