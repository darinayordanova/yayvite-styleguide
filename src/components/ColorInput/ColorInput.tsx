import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { IconButton } from '../IconButton/IconButton';

export interface ColorInputProps {
  /** Selected color as lowercase `#rrggbb` (controlled). Empty string for no color. */
  value?: string;
  /** Initially selected color as `#rrggbb` (uncontrolled). */
  defaultValue?: string;
  /** Called with the new color as lowercase `#rrggbb`, or an empty string when cleared. */
  onChange?: (value: string) => void;
  /** Preset colors shown in the picker. Defaults to the Yayvite palette; pass `[]` to hide them. */
  swatches?: string[];
  /** Visible label. If omitted, pass `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
  /** Shown in the text field when there is no color. Defaults to "#RRGGBB". */
  placeholder?: string;
  /** Hint shown below the field. Replaced by `error` when that is a string. */
  helperText?: ReactNode;
  /** Error state. A string is also shown as the message below the field. */
  error?: boolean | string;
  disabled?: boolean;
  /** Form field name. The value is submitted through a hidden input. */
  name?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** Class for the outer wrapper. */
  className?: string;
}

const defaultSwatches = [
  '#29473b',
  '#3e5e50',
  '#799486',
  '#b8c8be',
  '#633e3a',
  '#96635d',
  '#c8958d',
  '#e6c4be',
];

// Hue 0–360, saturation and value (brightness) 0–100.
interface Hsv {
  h: number;
  s: number;
  v: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const toHex = (rgb: number[]) =>
  '#' + rgb.map((n) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0')).join('');

const hexToHsv = (hex: string): Hsv => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let h = 0;
  if (delta) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max ? (delta / max) * 100 : 0, v: max * 100 };
};

const hsvToHex = ({ h, s, v }: Hsv) => {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return (v / 100) * (1 - (s / 100) * clamp(Math.min(k, 4 - k), 0, 1)) * 255;
  };
  return toHex([f(5), f(3), f(1)]);
};

let canvas: CanvasRenderingContext2D | null | undefined;

/**
 * Reads hex with or without `#` (3 or 6 digits), and any other CSS color the browser knows,
 * such as `rgb(62 94 80)`, `hsl(150 20% 30%)` or `teal`. Returns `#rrggbb`, or undefined.
 */
const parseColor = (text: string) => {
  const input = text.trim();
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input)?.[1];
  if (hex) {
    return ('#' + (hex.length === 3 ? hex.replace(/./g, '$&$&') : hex)).toLowerCase();
  }
  if (typeof document === 'undefined') return undefined;
  canvas ??= document.createElement('canvas').getContext('2d');
  if (!canvas) return undefined;
  // The canvas ignores colors it can't read, so it must give the same answer from two starts.
  canvas.fillStyle = '#000';
  canvas.fillStyle = input;
  const first = String(canvas.fillStyle);
  canvas.fillStyle = '#fff';
  canvas.fillStyle = input;
  if (String(canvas.fillStyle) !== first) return undefined;
  if (first.startsWith('#')) return first.toLowerCase();
  // Colors with transparency come back as rgba(); the alpha is dropped.
  const rgb = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(first);
  return rgb ? toHex(rgb.slice(1).map(Number)) : undefined;
};

// The EyeDropper API (Chromium only) is not in TypeScript's DOM types yet.
type EyeDropperConstructor = new () => { open: () => Promise<{ sRGBHex: string }> };

const getEyeDropper = () =>
  typeof window === 'undefined'
    ? undefined
    : (window as { EyeDropper?: EyeDropperConstructor }).EyeDropper;

/** Pointer handlers that report the pointer position inside the element as 0–1 fractions. */
const drag = (onMove: (x: number, y: number) => void) => {
  const update = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onMove(
      clamp((event.clientX - rect.left) / rect.width, 0, 1),
      clamp((event.clientY - rect.top) / rect.height, 0, 1),
    );
  };
  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      update(event);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event);
    },
  };
};

/** Arrow-key step: 1, or 10 with Shift. Returns undefined for other keys. */
const arrowStep = (event: KeyboardEvent, negative: string[], positive: string[]) => {
  const step = event.shiftKey ? 10 : 1;
  if (negative.includes(event.key)) return -step;
  if (positive.includes(event.key)) return step;
  return undefined;
};

/**
 * A color field. Type or paste any CSS color into it, or open the picker from the swatch:
 * drag in the saturation/brightness area, slide the hue, choose a preset or use the
 * eyedropper (where the browser supports it). Everything also works from the keyboard.
 */
export const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(function ColorInput(
  {
    value,
    defaultValue,
    onChange,
    swatches = defaultSwatches,
    label,
    placeholder = '#RRGGBB',
    helperText,
    error,
    disabled,
    name,
    id,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const triggerId = `${inputId}-trigger`;
  const popoverId = `${inputId}-picker`;
  const messageId = `${inputId}-message`;

  const [innerValue, setInnerValue] = useState(() => parseColor(defaultValue ?? '') ?? '');
  const current = value !== undefined ? (parseColor(value) ?? '') : innerValue;

  // What the user is typing, until it is committed. Null shows the current value.
  const [draft, setDraft] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  // Kept separately from the hex value so the hue survives dragging to gray, white or black.
  const [hsv, setHsv] = useState(() => hexToHsv(current || defaultSwatches[1]));

  const rootRef = useRef<HTMLDivElement>(null);
  const areaThumbRef = useRef<HTMLDivElement>(null);
  const hueThumbRef = useRef<HTMLDivElement>(null);
  // Set while the eyedropper is open, when the page may briefly lose focus.
  const picking = useRef(false);

  const hasError = Boolean(error);
  const message = typeof error === 'string' && error ? error : helperText;
  const EyeDropper = getEyeDropper();

  // Follow changes from outside, such as a controlled value or a typed color.
  useEffect(() => {
    if (current && current !== hsvToHex(hsv)) setHsv(hexToHsv(current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    if (open) areaThumbRef.current?.focus();
  }, [open]);

  const commit = (next: string) => {
    if (value === undefined) setInnerValue(next);
    if (next !== current) onChange?.(next);
  };

  const pick = (next: Hsv) => {
    setHsv(next);
    commit(hsvToHex(next));
  };

  const commitDraft = () => {
    if (draft === null) return;
    if (!draft.trim()) commit('');
    else {
      const parsed = parseColor(draft);
      // Anything unreadable falls back to the last valid color.
      if (parsed) commit(parsed);
    }
    setDraft(null);
  };

  const close = (restoreFocus: boolean) => {
    if (restoreFocus) document.getElementById(triggerId)?.focus();
    setOpen(false);
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (open && !picking.current && !rootRef.current?.contains(event.relatedTarget)) close(false);
  };

  const pickFromScreen = async () => {
    if (!EyeDropper) return;
    picking.current = true;
    try {
      const { sRGBHex } = await new EyeDropper().open();
      const parsed = parseColor(sRGBHex);
      if (parsed) {
        setHsv(hexToHsv(parsed));
        commit(parsed);
      }
    } catch {
      // Cancelled with Escape.
    } finally {
      picking.current = false;
    }
  };

  // Clicking the area or hue track keeps focus on their thumbs, inside the picker.
  const focusOnPress = (thumb: typeof areaThumbRef) => (event: { preventDefault: () => void }) => {
    event.preventDefault();
    thumb.current?.focus();
  };

  const s = Math.round(hsv.s);
  const v = Math.round(hsv.v);
  const h = Math.round(hsv.h);
  const shown = draft ?? current.toUpperCase();

  return (
    <div
      ref={rootRef}
      className={cx(
        'field',
        'color-input',
        hasError && 'field--error',
        disabled && 'field--disabled',
        className,
      )}
      onBlur={onBlur}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open && !event.defaultPrevented) {
          event.preventDefault();
          close(true);
        }
      }}
    >
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="select__anchor">
        <div className="field__control">
          <button
            id={triggerId}
            type="button"
            className={cx('color-input__swatch', !current && 'color-input__swatch--empty')}
            style={{ '--swatch': current || 'transparent' } as CSSProperties}
            aria-label="Open color picker"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? popoverId : undefined}
            disabled={disabled}
            onClick={() => (open ? close(true) : setOpen(true))}
          />
          <input
            ref={ref}
            id={inputId}
            type="text"
            className="field__input color-input__text"
            value={shown}
            placeholder={placeholder}
            disabled={disabled}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label={label ? undefined : ariaLabel}
            aria-labelledby={label ? undefined : ariaLabelledBy}
            aria-invalid={hasError || undefined}
            aria-describedby={message ? messageId : undefined}
            onChange={(event) => {
              const text = event.target.value;
              setDraft(text);
              // A complete 6-digit hex previews right away; anything else waits for Enter or blur.
              if (/^#?[0-9a-f]{6}$/i.test(text.trim())) commit(parseColor(text)!);
            }}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && draft !== null) {
                event.preventDefault();
                commitDraft();
              } else if (event.key === 'Escape' && draft !== null) {
                event.preventDefault();
                setDraft(null);
              } else if (event.key === 'ArrowDown' && event.altKey) {
                event.preventDefault();
                setOpen(true);
              }
            }}
          />
        </div>
        {open && (
          <div
            id={popoverId}
            className="color-input__popover"
            role="dialog"
            aria-label="Choose color"
            // Focusable so clicks on its padding keep focus inside and don't close it.
            tabIndex={-1}
          >
            <div
              className="color-input__area"
              style={{ '--hue': `hsl(${h} 100% 50%)` } as CSSProperties}
              onMouseDown={focusOnPress(areaThumbRef)}
              {...drag((x, y) => pick({ h: hsv.h, s: x * 100, v: (1 - y) * 100 }))}
            >
              <div
                ref={areaThumbRef}
                className="color-input__thumb"
                style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, '--swatch': hsvToHex(hsv) } as CSSProperties}
                role="slider"
                tabIndex={0}
                aria-label="Saturation and brightness"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={s}
                aria-valuetext={`Saturation ${s}%, brightness ${v}%`}
                onKeyDown={(event) => {
                  const ds = arrowStep(event, ['ArrowLeft'], ['ArrowRight']);
                  const dv = arrowStep(event, ['ArrowDown'], ['ArrowUp']);
                  if (ds === undefined && dv === undefined) return;
                  event.preventDefault();
                  pick({ h: hsv.h, s: clamp(s + (ds ?? 0), 0, 100), v: clamp(v + (dv ?? 0), 0, 100) });
                }}
              />
            </div>
            <div className="color-input__row">
              {EyeDropper && (
                <IconButton
                  icon="eyedropper"
                  size="sm"
                  className="color-input__eyedropper"
                  aria-label="Pick a color from the screen"
                  onClick={pickFromScreen}
                />
              )}
              <div
                className="color-input__hue"
                onMouseDown={focusOnPress(hueThumbRef)}
                {...drag((x) => pick({ ...hsv, h: x * 360 }))}
              >
                <div
                  ref={hueThumbRef}
                  className="color-input__thumb"
                  style={{ '--x': hsv.h / 360, '--swatch': `hsl(${h} 100% 50%)` } as CSSProperties}
                  role="slider"
                  tabIndex={0}
                  aria-label="Hue"
                  aria-valuemin={0}
                  aria-valuemax={360}
                  aria-valuenow={h}
                  aria-valuetext={`${h}°`}
                  onKeyDown={(event) => {
                    const step = arrowStep(event, ['ArrowLeft', 'ArrowDown'], ['ArrowRight', 'ArrowUp']);
                    let next: number;
                    if (step !== undefined) next = clamp(h + step, 0, 360);
                    else if (event.key === 'Home') next = 0;
                    else if (event.key === 'End') next = 360;
                    else return;
                    event.preventDefault();
                    pick({ ...hsv, h: next });
                  }}
                />
              </div>
            </div>
            {swatches.length > 0 && (
              <div className="color-input__presets" role="group" aria-label="Preset colors">
                {swatches.map((swatch) => {
                  const hex = parseColor(swatch);
                  if (!hex) return null;
                  return (
                    <button
                      key={swatch}
                      type="button"
                      className="color-input__preset"
                      style={{ '--swatch': hex } as CSSProperties}
                      aria-label={hex.toUpperCase()}
                      aria-pressed={hex === current}
                      onClick={() => {
                        setHsv(hexToHsv(hex));
                        commit(hex);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {name && <input type="hidden" name={name} value={current} />}
      {message && (
        <p id={messageId} className="field__message">
          {message}
        </p>
      )}
    </div>
  );
});
