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

export interface TimePickerProps {
  /** Selected time as 24-hour `HH:mm` (controlled). Empty string when nothing is selected. */
  value?: string;
  /** Initially selected time as 24-hour `HH:mm` (uncontrolled). */
  defaultValue?: string;
  /** Called with the chosen time as 24-hour `HH:mm`. */
  onChange?: (value: string) => void;
  /** Minutes between the listed minutes. Defaults to 5. */
  step?: number;
  /** Show a 12-hour clock with an AM/PM column. Defaults to true. */
  hour12?: boolean;
  /** Visible label. If omitted, pass `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
  /** Shown when nothing is selected. Defaults to "Select a time". */
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

interface Column {
  label: string;
  options: number[];
  selected: number | undefined;
  text: (option: number) => string;
  pick: (option: number) => void;
}

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

const pad = (n: number) => String(n).padStart(2, '0');

const range = (length: number, from = 0, step = 1) => Array.from({ length }, (_, i) => from + i * step);

// Text shown in the field for an `HH:mm` value, or an empty string without one.
const formatTime = (time: string | undefined, hour12: boolean) => {
  const match = TIME.exec(time ?? '');
  if (!match) return '';
  const hour = +match[1];
  return hour12 ? `${hour % 12 || 12}:${match[2]} ${hour >= 12 ? 'PM' : 'AM'}` : `${match[1]}:${match[2]}`;
};

// Reads typed text such as "4:30 PM", "4.30pm", "4p", "16:30" or "1630" as `HH:mm`.
const parseTime = (text: string) => {
  const match = /^\s*(\d{1,2})[:.]?(\d{2})?\s*(?:([ap])\.?m?\.?)?\s*$/i.exec(text);
  if (!match) return undefined;
  const period = match[3]?.toLowerCase();
  const minute = +(match[2] ?? 0);
  let hour = +match[1];
  if (period) {
    if (hour < 1 || hour > 12) return undefined;
    hour = (hour % 12) + (period === 'p' ? 12 : 0);
  }
  return hour > 23 || minute > 59 ? undefined : `${pad(hour)}:${pad(minute)}`;
};

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  {
    value,
    defaultValue,
    onChange,
    step = 5,
    hour12 = true,
    label,
    placeholder = 'Select a time',
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
  const popoverId = `${inputId}-popover`;
  const messageId = `${inputId}-message`;
  const optionId = (column: number, option: number) => `${inputId}-option-${column}-${option}`;

  const [innerValue, setInnerValue] = useState(defaultValue);
  const selectedValue = value !== undefined ? value : innerValue;
  const parsed = TIME.exec(selectedValue ?? '');
  const hour = parsed ? +parsed[1] : undefined;
  const minute = parsed ? +parsed[2] : undefined;

  const valueText = formatTime(selectedValue, hour12);
  const [text, setText] = useState(valueText);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const hasError = Boolean(error);
  const message = typeof error === 'string' && error ? error : helperText;

  const close = (restoreFocus: boolean) => {
    if (restoreFocus) document.getElementById(inputId)?.focus();
    setOpen(false);
  };

  const setValue = (next: string) => {
    if (value === undefined) setInnerValue(next);
    if (next !== (selectedValue ?? '')) onChange?.(next);
  };

  const commit = (nextHour: number, nextMinute: number) => setValue(`${pad(nextHour)}:${pad(nextMinute)}`);

  // Typed text becomes the value on Enter or on leaving the input: an empty
  // field clears it, and text that isn't a time is dropped.
  const commitText = () => {
    const next = text.trim() === '' ? '' : parseTime(text);
    if (next !== undefined) setValue(next);
    setText(next !== undefined ? formatTime(next, hour12) : valueText);
  };

  // Picking one part of an empty time fills in the others from noon.
  const baseHour = hour ?? 12;
  const baseMinute = minute ?? 0;

  const minuteStep = Math.max(1, Math.floor(step));
  const minutes = range(Math.ceil(60 / minuteStep), 0, minuteStep);
  // A selected minute that falls between steps is listed too, so it can be shown.
  if (minute !== undefined && !minutes.includes(minute)) {
    minutes.push(minute);
    minutes.sort((a, b) => a - b);
  }

  const columns: Column[] = [
    hour12
      ? {
          label: 'Hour',
          options: range(12, 1),
          selected: hour === undefined ? undefined : hour % 12 || 12,
          text: String,
          pick: (option) => commit((option % 12) + (baseHour >= 12 ? 12 : 0), baseMinute),
        }
      : {
          label: 'Hour',
          options: range(24),
          selected: hour,
          text: pad,
          pick: (option) => commit(option, baseMinute),
        },
    {
      label: 'Minute',
      options: minutes,
      selected: minute,
      text: pad,
      pick: (option) => commit(baseHour, option),
    },
  ];
  if (hour12) {
    columns.push({
      label: 'AM/PM',
      options: [0, 1],
      selected: hour === undefined ? undefined : hour >= 12 ? 1 : 0,
      text: (option) => (option ? 'PM' : 'AM'),
      pick: (option) => commit((baseHour % 12) + option * 12, baseMinute),
    });
  }

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        // Opens the columns, then moves into the hours.
        if (open) popoverRef.current?.querySelector<HTMLElement>('[role="listbox"]')?.focus();
        else setOpen(true);
        break;
      case 'Enter':
        // With the columns closed and nothing typed, Enter submits the surrounding form as usual.
        if (open || text !== valueText) {
          event.preventDefault();
          commitText();
          close(false);
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          close(false);
        }
        break;
    }
  };

  const onColumnKeyDown = (event: KeyboardEvent<HTMLUListElement>, column: Column) => {
    const { options } = column;
    const index = column.selected === undefined ? -1 : options.indexOf(column.selected);
    const lastIndex = options.length - 1;
    const sibling = (element: Element | null) => (element as HTMLElement | null)?.focus();

    switch (event.key) {
      case 'ArrowDown':
        column.pick(options[Math.min(index + 1, lastIndex)]);
        break;
      case 'ArrowUp':
        column.pick(options[index < 0 ? lastIndex : Math.max(index - 1, 0)]);
        break;
      case 'Home':
        column.pick(options[0]);
        break;
      case 'End':
        column.pick(options[lastIndex]);
        break;
      case 'ArrowLeft':
        sibling(event.currentTarget.previousElementSibling);
        break;
      case 'ArrowRight':
        sibling(event.currentTarget.nextElementSibling);
        break;
      case 'Enter':
        close(true);
        break;
      default:
        return;
    }

    event.preventDefault();
  };

  // Close when focus leaves the field, by tabbing away or clicking elsewhere.
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (open && !rootRef.current?.contains(event.relatedTarget)) close(false);
  };

  // Follow value changes made from the columns or from outside.
  useEffect(() => {
    setText(valueText);
  }, [valueText]);

  // Keep the selected hour, minute and AM/PM in the middle of their columns.
  useEffect(() => {
    if (!open) return;
    popoverRef.current?.querySelectorAll<HTMLElement>('[aria-selected="true"]').forEach((option) => {
      const column = option.parentElement;
      if (column) column.scrollTop = option.offsetTop - (column.clientHeight - option.offsetHeight) / 2;
    });
  }, [open, selectedValue]);

  return (
    <div
      ref={rootRef}
      className={cx(
        'field',
        'time-picker',
        hasError && 'field--error',
        disabled && 'field--disabled',
        className,
      )}
      onBlur={onBlur}
    >
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="select__anchor">
        <div className="field__control">
          <Icon name="clock" />
          <input
            ref={ref}
            id={inputId}
            type="text"
            role="combobox"
            className="field__input"
            value={text}
            placeholder={placeholder}
            autoComplete="off"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? popoverId : undefined}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-invalid={hasError || undefined}
            aria-describedby={message ? messageId : undefined}
            disabled={disabled}
            onChange={(event) => setText(event.target.value)}
            onClick={() => setOpen(true)}
            onKeyDown={onInputKeyDown}
            onBlur={commitText}
          />
        </div>
        {open && (
          <div
            ref={popoverRef}
            id={popoverId}
            className="select__listbox time-picker__popover"
            role="dialog"
            aria-label="Choose time"
            // Keep focus where it is so clicking inside doesn't close the picker
            // or take the cursor out of the input.
            onMouseDown={(event) => event.preventDefault()}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                close(true);
              }
            }}
          >
            {columns.map((column, columnIndex) => (
              <ul
                key={column.label}
                role="listbox"
                className="time-picker__column"
                tabIndex={0}
                aria-label={column.label}
                aria-activedescendant={
                  column.selected === undefined ? undefined : optionId(columnIndex, column.selected)
                }
                onKeyDown={(event) => onColumnKeyDown(event, column)}
              >
                {column.options.map((option) => (
                  <li
                    key={option}
                    id={optionId(columnIndex, option)}
                    role="option"
                    className="select__option time-picker__option"
                    aria-selected={option === column.selected}
                    onClick={() => column.pick(option)}
                  >
                    {column.text(option)}
                  </li>
                ))}
              </ul>
            ))}
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
