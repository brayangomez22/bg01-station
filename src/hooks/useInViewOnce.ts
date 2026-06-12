import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Returns a ref + boolean that flips to true once the element enters the
 * viewport. Disconnects after first intersection (one-shot reveal).
 */
export function useInViewOnce<T extends Element = HTMLDivElement>(
  rootMargin = '0px 0px -10% 0px',
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView];
}
