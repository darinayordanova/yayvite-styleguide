import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';

export interface DatePickerProps {
  /** Selected date as `YYYY-MM-DD` (controlled). Empty string when nothing is selected. */
  value?: string;
  /** Initially selected date as `YYYY-MM-DD` (uncontrolled). */
  defaultValue?: string;
  /** Called with the chosen date as `YYYY-MM-DD`. */
  onChange?: (value: string) => void;
  /** Earliest selectable date as `YYYY-MM-DD`. */
  min?: string;
  /** Latest selectable date as `YYYY-MM-DD`. */
  max?: string;
  /** First day of the week: 0 is Sunday, 1 is Monday. Defaults to 1. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Locale for the month, weekday and date text. Defaults to the browser's. */
  locale?: string;
  /** Visible label. If omitted, pass `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
  /** Shown when nothing is selected. Defaults to "Select a date". */
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

const pad = (n: number) => String(n).padStart(2, '0');

const toIso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parse = (iso?: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  return match ? new Date(+match[1], +match[2] - 1, +match[3]) : undefined;
};

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

// Same day in another month, or that month's last day when it is shorter.
const addMonths = (date: Date, months: number) => {
  const first = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const day = Math.min(date.getDate(), daysInMonth(first.getFullYear(), first.getMonth()));
  return new Date(first.getFullYear(), first.getMonth(), day);
};

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(
  {
    value,
    defaultValue,
    onChange,
    min,
    max,
    weekStartsOn = 1,
    locale,
    label,
    placeholder = 'Select a date',
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
  const triggerId = id ?? autoId;
  const labelId = `${triggerId}-label`;
  const valueId = `${triggerId}-value`;
  const monthId = `${triggerId}-month`;
  const messageId = `${triggerId}-message`;

  const [innerValue, setInnerValue] = useState(defaultValue);
  const selectedValue = value !== undefined ? value : innerValue;
  const selectedDate = parse(selectedValue);

  const today = toIso(new Date());
  const [open, setOpen] = useState(false);
  // The day that has keyboard focus; its month is the one shown.
  const [focused, setFocused] = useState(today);
  const focusedDate = parse(focused) ?? new Date();
  const year = focusedDate.getFullYear();
  const month = focusedDate.getMonth();

  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);
  // Set when the focused day should also take DOM focus after the next render.
  const moveFocus = useRef(false);

  const hasError = Boolean(error);
  const message = typeof error === 'string' && error ? error : helperText;

  // `YYYY-MM-DD` strings sort chronologically, so they compare as text.
  const clamp = (iso: string) => (min && iso < min ? min : max && iso > max ? max : iso);
  const outOfRange = (iso: string) => Boolean((min && iso < min) || (max && iso > max));
  const canGoBack = !min || toIso(new Date(year, month, 1)) > min;
  const canGoForward = !max || toIso(new Date(year, month + 1, 0)) < max;

  const openCalendar = () => {
    moveFocus.current = true;
    setFocused(clamp(selectedDate ? toIso(selectedDate) : today));
    setOpen(true);
  };

  const close = (restoreFocus: boolean) => {
    if (restoreFocus) document.getElementById(triggerId)?.focus();
    setOpen(false);
  };

  const choose = (iso: string) => {
    if (value === undefined) setInnerValue(iso);
    if (iso !== selectedValue) onChange?.(iso);
    close(true);
  };

  const showMonth = (offset: 1 | -1) => setFocused(clamp(toIso(addMonths(focusedDate, offset))));

  const focusDay = (date: Date) => {
    const next = clamp(toIso(date));
    if (next === focused) return;
    moveFocus.current = true;
    setFocused(next);
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const weekday = (focusedDate.getDay() - weekStartsOn + 7) % 7;
    let next: Date;

    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(focusedDate, -1);
        break;
      case 'ArrowRight':
        next = addDays(focusedDate, 1);
        break;
      case 'ArrowUp':
        next = addDays(focusedDate, -7);
        break;
      case 'ArrowDown':
        next = addDays(focusedDate, 7);
        break;
      case 'Home':
        next = addDays(focusedDate, -weekday);
        break;
      case 'End':
        next = addDays(focusedDate, 6 - weekday);
        break;
      case 'PageUp':
        next = addMonths(focusedDate, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(focusedDate, event.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }

    event.preventDefault();
    focusDay(next);
  };

  // Close when focus leaves the field, by tabbing away or clicking elsewhere.
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (open && !rootRef.current?.contains(event.relatedTarget)) close(false);
  };

  useEffect(() => {
    if (open && moveFocus.current) {
      moveFocus.current = false;
      gridRef.current?.querySelector<HTMLButtonElement>('[tabindex="0"]')?.focus();
    }
  }, [open, focused]);

  const monthText = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(focusedDate);
  const dayText = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
  // 4 January 2026 is a Sunday.
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2026, 0, 4 + weekStartsOn + i)).map((date) => ({
    short: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
    long: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date),
  }));

  // Days of the shown month, padded with blanks to whole weeks.
  const blanks = (new Date(year, month, 1).getDay() - weekStartsOn + 7) % 7;
  const cells: (Date | undefined)[] = [
    ...Array.from({ length: blanks }, () => undefined),
    ...Array.from({ length: daysInMonth(year, month) }, (_, i) => new Date(year, month, i + 1)),
  ];
  const weeks = Array.from({ length: Math.ceil(cells.length / 7) }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  return (
    <div
      ref={rootRef}
      className={cx(
        'field',
        'date-picker',
        hasError && 'field--error',
        disabled && 'field--disabled',
        className,
      )}
      onBlur={onBlur}
    >
      {label && (
        <label id={labelId} className="field__label" htmlFor={triggerId}>
          {label}
        </label>
      )}
      <div className="select__anchor">
        <button
          ref={ref}
          id={triggerId}
          type="button"
          className="field__control select__trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby={label ? `${labelId} ${valueId}` : ariaLabelledBy}
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={hasError || undefined}
          aria-describedby={message ? messageId : undefined}
          disabled={disabled}
          // Focus goes to the calendar on opening and comes back on closing.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => (open ? close(true) : openCalendar())}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && !open) {
              event.preventDefault();
              openCalendar();
            }
          }}
        >
          <Icon name="calendar" />
          <span id={valueId} className={cx('select__value', !selectedDate && 'select__value--placeholder')}>
            {selectedDate
              ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(selectedDate)
              : placeholder}
          </span>
        </button>
        {open && (
          <div
            className="date-picker__popover"
            role="dialog"
            aria-label="Choose date"
            // Keep focus where it is so clicking inside doesn't close the calendar.
            onMouseDown={(event) => event.preventDefault()}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                close(true);
              }
            }}
          >
            <div className="date-picker__header">
              {/* aria-disabled rather than disabled, so a focused button keeps focus at the end of the range. */}
              <IconButton
                icon="chevron"
                size="sm"
                className="date-picker__nav date-picker__nav--prev"
                aria-label="Previous month"
                aria-disabled={!canGoBack || undefined}
                onClick={() => canGoBack && showMonth(-1)}
              />
              <span id={monthId} className="date-picker__month" aria-live="polite">
                {monthText}
              </span>
              <IconButton
                icon="chevron"
                size="sm"
                className="date-picker__nav"
                aria-label="Next month"
                aria-disabled={!canGoForward || undefined}
                onClick={() => canGoForward && showMonth(1)}
              />
            </div>
            <table
              ref={gridRef}
              role="grid"
              className="date-picker__grid"
              aria-labelledby={monthId}
              onKeyDown={onGridKeyDown}
            >
              <thead>
                <tr>
                  {weekdays.map((weekday) => (
                    <th key={weekday.long} scope="col" abbr={weekday.long} className="date-picker__weekday">
                      {weekday.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, index) => (
                  <tr key={index}>
                    {week.map((date, column) => {
                      if (!date) return <td key={column} />;
                      const iso = toIso(date);
                      const isSelected = iso === selectedValue;
                      return (
                        <td key={column} role="gridcell" aria-selected={isSelected}>
                          <button
                            type="button"
                            className={cx(
                              'date-picker__day',
                              iso === today && 'date-picker__day--today',
                              isSelected && 'date-picker__day--selected',
                            )}
                            tabIndex={iso === focused ? 0 : -1}
                            aria-label={dayText.format(date)}
                            aria-current={iso === today ? 'date' : undefined}
                            disabled={outOfRange(iso)}
                            onClick={() => choose(iso)}
                          >
                            {date.getDate()}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {name && <input type="hidden" name={name} value={selectedValue ?? ''} />}
      {message && (
        <p id={messageId} className="field__message">
          {message}
        </p>
      )}
    </div>
  );
});
