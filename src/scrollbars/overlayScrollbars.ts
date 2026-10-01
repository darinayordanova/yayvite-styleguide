// macOS-style overlay scrollbars for every scrollable element.
//
// Native scrollbars always reserve a gutter beside the content (except on macOS),
// and CSS alone can't make them float over it or appear only while scrolling.
// So this hides the native ones and, whenever an element scrolls, draws a thumb
// over it that fades out shortly after scrolling stops. The thumb stays while
// hovered and can be dragged.
//
// Opt an element out with data-scrollbar="none" (e.g. a carousel that should
// show no scrollbar at all).

export interface OverlayScrollbarOptions {
  /** How long the thumb stays after scrolling stops, in ms. Defaults to 1000. */
  hideDelay?: number;
}

type Axis = 'x' | 'y';

interface Thumb {
  el: HTMLDivElement;
  /** Scroll distance per pixel of thumb movement, for dragging. */
  ratio: number;
  dragging: boolean;
}

interface Bar {
  scroller: Element;
  layer: HTMLElement;
  x: Thumb;
  y: Thumb;
  hovered: boolean;
  hideTimer?: number;
  removeTimer?: number;
}

const ROOT_CLASS = 'yv-overlay-scrollbars';
const INSET = 3; // gap between the thumb and the edges, like macOS
const MIN_THUMB = 32;
const FADE_MS = 400; // matches the opacity transition in scrollbars.scss

let users = 0;
let teardown: (() => void) | undefined;

/**
 * Turns on overlay scrollbars for the whole page. Call once when the app starts;
 * returns a function that turns them off again. Safe to call more than once.
 *
 * ```ts
 * useEffect(() => enableOverlayScrollbars(), []);
 * ```
 */
export function enableOverlayScrollbars(options: OverlayScrollbarOptions = {}): () => void {
  if (typeof document === 'undefined') return () => {};
  users += 1;
  teardown ??= start(options.hideDelay ?? 1000);
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    users -= 1;
    if (users === 0) {
      teardown?.();
      teardown = undefined;
    }
  };
}

function start(hideDelay: number): () => void {
  const root = document.documentElement;
  const bars = new Map<Element, Bar>();
  // Where our own CSS hides native scrollbars with ::-webkit-scrollbar, an element whose
  // `scrollbar-width` is set was styled on purpose (e.g. hidden) and is left alone.
  const webkit = CSS.supports('selector(::-webkit-scrollbar)');

  root.classList.add(ROOT_CLASS);

  const skip = (scroller: Element) =>
    scroller.matches('[data-scrollbar="none"]') ||
    (webkit && getComputedStyle(scroller).scrollbarWidth !== 'auto');

  // Thumbs go in a layer inside the open <dialog> that holds the scroller, if any:
  // a modal dialog sits in the top layer, above anything appended to <body>.
  const layerFor = (scroller: Element) => {
    const host = scroller.closest('dialog[open]') ?? document.body;
    let layer = Array.from(host.children).find((child) => child.classList.contains('yv-scrollbars'));
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'yv-scrollbars';
      layer.setAttribute('aria-hidden', 'true');
      host.append(layer);
    }
    return layer as HTMLElement;
  };

  const createThumb = (bar: () => Bar, axis: Axis): Thumb => {
    const el = document.createElement('div');
    el.className = `yv-scrollbar yv-scrollbar--${axis}`;
    const thumb: Thumb = { el, ratio: 0, dragging: false };

    el.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      el.setPointerCapture(event.pointerId);
      thumb.dragging = true;
      const { scroller } = bar();
      const startPointer = axis === 'y' ? event.clientY : event.clientX;
      const startScroll = axis === 'y' ? scroller.scrollTop : scroller.scrollLeft;
      const move = (e: PointerEvent) => {
        const delta = ((axis === 'y' ? e.clientY : e.clientX) - startPointer) * thumb.ratio;
        if (axis === 'y') scroller.scrollTop = startScroll + delta;
        else scroller.scrollLeft = startScroll + delta;
      };
      const end = () => {
        thumb.dragging = false;
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', end);
        el.removeEventListener('pointercancel', end);
        scheduleHide(bar());
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    });
    el.addEventListener('pointerenter', () => {
      const b = bar();
      b.hovered = true;
      show(b);
    });
    el.addEventListener('pointerleave', () => {
      const b = bar();
      b.hovered = false;
      scheduleHide(b);
    });
    return thumb;
  };

  const getBar = (scroller: Element) => {
    let bar = bars.get(scroller);
    if (!bar) {
      const created: Bar = {
        scroller,
        layer: layerFor(scroller),
        x: createThumb(() => created, 'x'),
        y: createThumb(() => created, 'y'),
        hovered: false,
      };
      created.layer.append(created.x.el, created.y.el);
      bars.set(scroller, created);
      bar = created;
    }
    return bar;
  };

  const place = (bar: Bar) => {
    const { scroller } = bar;
    const isRoot = scroller === document.scrollingElement;
    const size = parseFloat(getComputedStyle(root).getPropertyValue('--scrollbar-size')) || 12;
    const box = isRoot ? { left: 0, top: 0 } : scroller.getBoundingClientRect();
    // The layer may be positioned against a transformed dialog rather than the viewport.
    const origin = bar.layer.getBoundingClientRect();
    const left = box.left + (isRoot ? 0 : scroller.clientLeft) - origin.left;
    const top = box.top + (isRoot ? 0 : scroller.clientTop) - origin.top;
    const width = scroller.clientWidth;
    const height = scroller.clientHeight;
    const rtl = getComputedStyle(scroller).direction === 'rtl';
    const rangeY = scroller.scrollHeight - height;
    const rangeX = scroller.scrollWidth - width;
    const hasY = rangeY > 1;
    const hasX = rangeX > 1;

    const set = (thumb: Thumb, visible: boolean, x = 0, y = 0, w = 0, h = 0) => {
      thumb.el.hidden = !visible;
      if (visible) {
        thumb.el.style.transform = `translate(${x}px, ${y}px)`;
        thumb.el.style.width = `${w}px`;
        thumb.el.style.height = `${h}px`;
      }
    };

    if (hasY) {
      const track = height - INSET * 2 - (hasX ? size : 0);
      const length = Math.max(MIN_THUMB, (track * height) / scroller.scrollHeight);
      const travel = Math.max(track - length, 1);
      bar.y.ratio = rangeY / travel;
      const offset = (scroller.scrollTop / rangeY) * travel;
      set(bar.y, true, rtl ? left : left + width - size, top + INSET + offset, size, length);
    } else set(bar.y, false);

    if (hasX) {
      const track = width - INSET * 2 - (hasY ? size : 0);
      const length = Math.max(MIN_THUMB, (track * width) / scroller.scrollWidth);
      const travel = Math.max(track - length, 1);
      bar.x.ratio = rangeX / travel;
      // In right-to-left content scrollLeft runs from -range to 0.
      const progress = Math.abs(scroller.scrollLeft) / rangeX;
      const start = rtl ? (hasY ? size : 0) + INSET + travel * (1 - progress) : INSET + travel * progress;
      set(bar.x, true, left + start, top + height - size, length, size);
    } else set(bar.x, false);
  };

  const show = (bar: Bar) => {
    window.clearTimeout(bar.hideTimer);
    window.clearTimeout(bar.removeTimer);
    place(bar);
    bar.x.el.classList.add('yv-scrollbar--visible');
    bar.y.el.classList.add('yv-scrollbar--visible');
  };

  const scheduleHide = (bar: Bar) => {
    window.clearTimeout(bar.hideTimer);
    bar.hideTimer = window.setTimeout(() => {
      if (bar.hovered || bar.x.dragging || bar.y.dragging) return;
      bar.x.el.classList.remove('yv-scrollbar--visible');
      bar.y.el.classList.remove('yv-scrollbar--visible');
      // Once faded out, drop the thumbs so nothing lingers for removed elements.
      bar.removeTimer = window.setTimeout(() => remove(bar), FADE_MS);
    }, hideDelay);
  };

  const remove = (bar: Bar) => {
    window.clearTimeout(bar.hideTimer);
    window.clearTimeout(bar.removeTimer);
    bar.x.el.remove();
    bar.y.el.remove();
    if (!bar.layer.children.length) bar.layer.remove();
    bars.delete(bar.scroller);
  };

  const onScroll = (event: Event) => {
    const target = event.target;
    const scroller =
      target === document ? document.scrollingElement : target instanceof Element ? target : null;
    if (!scroller || skip(scroller)) return;
    const bar = getBar(scroller);
    show(bar);
    scheduleHide(bar);
  };

  const onResize = () => bars.forEach(place);

  document.addEventListener('scroll', onScroll, { capture: true, passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  return () => {
    document.removeEventListener('scroll', onScroll, { capture: true });
    window.removeEventListener('resize', onResize);
    bars.forEach(remove);
    root.classList.remove(ROOT_CLASS);
  };
}
