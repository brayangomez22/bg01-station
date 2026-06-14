import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/paths';
import { useSound } from '@/app/providers/SoundProvider';
import { cn } from '@/lib/cn';
import styles from './CommandConsole.module.css';

/** Anyone (e.g. the HUD button) can open the console via this event. */
export const OPEN_CONSOLE_EVENT = 'bg01:console';

interface Command {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  /** Returns a console response line, or undefined to close silently. */
  run: () => string | undefined;
}

export function CommandConsole() {
  const navigate = useNavigate();
  const { play } = useSound();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [response, setResponse] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setCursor(0);
    setResponse(null);
  }, []);

  const commands = useMemo<Command[]>(
    () => [
      {
        id: 'bridge',
        label: 'ir puente',
        hint: 'inicio',
        keywords: 'home inicio bridge',
        run: () => void navigate(ROUTES.bridge),
      },
      {
        id: 'pilot',
        label: 'ir piloto',
        hint: 'sobre mí',
        keywords: 'about sobre mi perfil',
        run: () => void navigate(ROUTES.pilot),
      },
      {
        id: 'systems',
        label: 'ir sistemas',
        hint: 'tecnologías',
        keywords: 'stack tecnologias skills',
        run: () => void navigate(ROUTES.systems),
      },
      {
        id: 'missions',
        label: 'ir misiones',
        hint: 'proyectos',
        keywords: 'proyectos projects portfolio',
        run: () => void navigate(ROUTES.missions),
      },
      {
        id: 'logbook',
        label: 'ir bitácora',
        hint: 'experiencia',
        keywords: 'experiencia cv trayectoria',
        run: () => void navigate(ROUTES.logbook),
      },
      {
        id: 'comms',
        label: 'abrir comms',
        hint: 'contacto',
        keywords: 'contacto contact email',
        run: () => void navigate(ROUTES.comms),
      },
      {
        id: 'archive',
        label: 'ir archivo',
        hint: 'blog técnico',
        keywords: 'blog articulos archivo conocimiento registros knowledge',
        run: () => void navigate(ROUTES.archive),
      },
    ],
    [navigate],
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.includes(q) || c.keywords.includes(q) || c.hint.includes(q),
    );
  }, [commands, query]);

  // Global hotkey + external open event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_CONSOLE_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_CONSOLE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const execute = (cmd: Command) => {
    play('select');
    const reply = cmd.run();
    if (reply) {
      setResponse(reply);
      setQuery('');
      setCursor(0);
    } else {
      close();
    }
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = matches[cursor];
      if (cmd) execute(cmd);
    } else if (e.key === 'Tab') {
      // Single-input UI: keep focus inside the console.
      e.preventDefault();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.console}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={close}
        >
          <motion.div
            className={styles.console__panel}
            role="dialog"
            aria-modal="true"
            aria-label="Consola de comandos de la estación"
            initial={{ y: -8, scale: 0.99 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -6, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.console__prompt}>
              <span aria-hidden="true">&gt;</span>
              <input
                ref={inputRef}
                className={styles.console__input}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                  setResponse(null);
                }}
                onKeyDown={onInputKey}
                placeholder="comando… (ir misiones, abrir comms)"
                aria-label="Comando"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className={styles.console__kbd}>ESC</kbd>
            </div>

            {response ? (
              <p className={styles.console__response} aria-live="polite">
                &gt; {response}
              </p>
            ) : (
              <ul className={styles.console__list} role="listbox" aria-label="Comandos">
                {matches.length === 0 && (
                  <li className={styles.console__empty}>&gt; comando no reconocido</li>
                )}
                {matches.map((cmd, i) => (
                  <li key={cmd.id} role="option" aria-selected={i === cursor}>
                    <button
                      type="button"
                      className={cn(
                        styles.console__item,
                        i === cursor && styles['console__item--active'],
                      )}
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => execute(cmd)}
                      tabIndex={-1}
                    >
                      <span>{cmd.label}</span>
                      <span className={styles.console__hint}>{cmd.hint}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
