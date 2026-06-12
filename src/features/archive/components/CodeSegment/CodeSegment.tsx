import { useEffect, useRef, useState } from 'react';
import styles from './CodeSegment.module.css';

interface CodeSegmentProps {
  lang: string;
  code: string;
}

/** Terminal-chromed code block with diegetic copy acknowledgment. */
export function CodeSegment({ lang, code }: CodeSegmentProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard denied (permissions/insecure context): nothing to ack.
    }
  };

  return (
    <figure className={styles.code}>
      <figcaption className={styles.code__chrome}>
        <span>SEGMENTO DE CÓDIGO · {lang.toUpperCase()}</span>
        <button type="button" className={styles.code__copy} onClick={copy}>
          {copied ? 'COPIADO · SUMA DE CONTROL OK' : '[ COPIAR ]'}
        </button>
      </figcaption>
      <pre className={styles.code__pre}>
        <code>{code}</code>
      </pre>
    </figure>
  );
}
