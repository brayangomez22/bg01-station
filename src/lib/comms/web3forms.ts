import type { TransmissionPayload } from '@/types/domain';

/**
 * Web3Forms delivery for the comms console.
 *
 * The access key is **public by design**: it only routes submissions to the
 * inbox registered for it and is guarded by Web3Forms' own spam filtering plus
 * our honeypot, so it is safe to ship in client-side code. Override it per
 * environment with `VITE_WEB3FORMS_ACCESS_KEY` (see `.env.example`).
 */
const ACCESS_KEY: string =
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ??
  'c56f797d-37cf-4cb9-8048-b7b668f954e4';

const ENDPOINT = 'https://api.web3forms.com/submit';

/**
 * Deliver a transmission to the station inbox. Resolves on success and throws
 * on any network or provider error so the caller can surface the `error` state.
 */
export async function deliverTransmission(payload: TransmissionPayload): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      access_key: ACCESS_KEY,
      from_name: 'BG-01 Station',
      subject: `Nueva transmisión BG-01 · ${payload.from}`,
      name: payload.from,
      email: payload.frequency,
      message: payload.message,
      // Web3Forms' native honeypot field — keep it empty.
      botcheck: '',
    }),
  });

  const data: { success?: boolean; message?: string } = await res
    .json()
    .catch(() => ({}));

  if (!res.ok || !data.success) {
    throw new Error(data.message ?? `Transmission failed (${res.status})`);
  }
}
