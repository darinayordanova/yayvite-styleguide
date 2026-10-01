import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

/**
 * Measures the element marked `data-active` inside `container` and returns CSS variables
 * (`--indicator-x`, `--indicator-width`) for a sliding indicator such as a tab underline.
 * Re-measures when `activeKey` changes and whenever the container or its children resize,
 * e.g. once web fonts load. `ready` turns true after the first measurement, so the
 * indicator can appear in place and only animate later moves.
 */
export function useIndicator(container: RefObject<HTMLElement | null>, activeKey: unknown) {
  const [rect, setRect] = useState<{ x: number; width: number }>();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const root = container.current;
    if (!root) return;

    const measure = () => {
      const active = root.querySelector<HTMLElement>('[data-active]');
      const x = active?.offsetLeft ?? 0;
      const width = active?.offsetWidth ?? 0;
      setRect((prev) =>
        !active ? undefined : prev && prev.x === x && prev.width === width ? prev : { x, width },
      );
    };
    measure();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    // Skips the indicator itself, which resizes on every frame while it animates.
    for (const child of Array.from(root.children)) {
      if (!child.hasAttribute('aria-hidden')) observer.observe(child);
    }
    return () => observer.disconnect();
  }, [container, activeKey]);

  useLayoutEffect(() => {
    if (!rect || ready) return;
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [rect, ready]);

  const style = rect
    ? ({ '--indicator-x': `${rect.x}px`, '--indicator-width': `${rect.width}px` } as CSSProperties)
    : undefined;

  return { style, visible: Boolean(rect), ready };
}
