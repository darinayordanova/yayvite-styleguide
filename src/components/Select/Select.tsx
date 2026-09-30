import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import type { IconName } from '../../icons/generated/icon-names';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  /** Selected value (controlled). */
  value?: string;
  /** Initially selected value (uncontrolled). */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Visible label. If omitted, pass `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
  /** Shown when nothing is selected. Defaults to "Select an option". */
  placeholder?: string;
  /** Hint shown below the field. Replaced by `error` when that is a string. */
  helperText?: ReactNode;
  /** Error state. A string is also shown as the message below the field. */
  error?: boolean | string;
  iconStart?: IconName;
  disabled?: boolean;
  required?: boolean;
  /** Form field name. The value is submitted through a hidden input. */
  name?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** Class for the outer wrapper. */
  className?: string;
}

const TYPEAHEAD_RESET_MS = 500;

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    options,
    value,
    defaultValue,
    onChange,
    label,
    placeholder = 'Select an option',
    helperText,
    error,
    iconStart,
    disabled,
    required,
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
  const listId = `${triggerId}-listbox`;
  const messageId = `${triggerId}-message`;
  const optionId = (index: number) => `${triggerId}-option-${index}`;

  const [innerValue, setInnerValue] = useState(defaultValue);
  const selectedValue = value !== undefined ? value : innerValue;
  const selectedIndex = options.findIndex((o) => o.value === selectedValue);
  const selected = options[selectedIndex];

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ text: '', timer: 0 });

  const hasError = Boolean(error);
  const message = typeof error === 'string' && error ? error : helperText;

  const enabledIndexes = options.flatMap((o, i) => (o.disabled ? [] : [i]));

  const openAt = (index: number) => {
    setOpen(true);
    setActiveIndex(index);
  };

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    if (value === undefined) setInnerValue(option.value);
    if (option.value !== selectedValue) onChange?.(option.value);
    close();
  };

  // Next enabled option in `direction` from `from`, clamped to the ends.
  const step = (from: number, direction: 1 | -1) => {
    const candidates = direction === 1 ? enabledIndexes : [...enabledIndexes].reverse();
    return candidates.find((i) => (direction === 1 ? i > from : i < from)) ?? from;
  };

  const first = enabledIndexes[0] ?? -1;
  const last = enabledIndexes[enabledIndexes.length - 1] ?? -1;
  const initial = selectedIndex >= 0 && !options[selectedIndex].disabled ? selectedIndex : first;

  const findByText = (key: string) => {
    const t = typeahead.current;
    window.clearTimeout(t.timer);
    t.text += key.toLowerCase();
    t.timer = window.setTimeout(() => (t.text = ''), TYPEAHEAD_RESET_MS);

    const start = open ? activeIndex : selectedIndex;
    // Search from the option after the current one, wrapping around, so
    // pressing the same letter repeatedly cycles through matches.
    const ordered = [...enabledIndexes.filter((i) => i > start), ...enabledIndexes.filter((i) => i <= start)];
    const matchesAll = (s: string) => ordered.find((i) => options[i].label.toLowerCase().startsWith(s));
    const repeated = t.text.split('').every((c) => c === t.text[0]);
    return matchesAll(t.text) ?? (repeated ? matchesAll(t.text[0]) : undefined);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const { key } = event;

    if (!open) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        openAt(initial);
      } else if (key === 'Home') {
        event.preventDefault();
        openAt(first);
      } else if (key === 'End') {
        event.preventDefault();
        openAt(last);
      } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const match = findByText(key);
        if (match !== undefined) openAt(match);
      }
      return;
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        if (event.altKey) choose(activeIndex);
        else setActiveIndex((i) => step(i, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (event.altKey) choose(activeIndex);
        else setActiveIndex((i) => step(i, -1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(first);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(last);
        break;
      case 'PageDown':
        event.preventDefault();
        setActiveIndex((i) => enabledIndexes.find((j) => j >= i + 10) ?? last);
        break;
      case 'PageUp':
        event.preventDefault();
        setActiveIndex((i) => [...enabledIndexes].reverse().find((j) => j <= i - 10) ?? first);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        choose(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        choose(activeIndex);
        break;
      default:
        if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const match = findByText(key);
          if (match !== undefined) setActiveIndex(match);
        }
    }
  };

  // Close when clicking anywhere outside.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the active option in view while navigating with the keyboard.
  useEffect(() => {
    if (open && activeIndex >= 0) {
      document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, activeIndex]);

  useEffect(() => () => window.clearTimeout(typeahead.current.timer), []);

  return (
    <div
      ref={rootRef}
      className={cx(
        'field',
        'select',
        open && 'select--open',
        hasError && 'field--error',
        disabled && 'field--disabled',
        className,
      )}
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
          role="combobox"
          className="field__control select__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          aria-labelledby={label ? labelId : ariaLabelledBy}
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={hasError || undefined}
          aria-required={required || undefined}
          aria-describedby={message ? messageId : undefined}
          disabled={disabled}
          onClick={() => (open ? close() : openAt(initial))}
          onKeyDown={onKeyDown}
          onBlur={close}
        >
          {iconStart && <Icon name={iconStart} />}
          <span className={cx('select__value', !selected && 'select__value--placeholder')}>
            {selected ? selected.label : placeholder}
          </span>
          <Icon name="chevron" className="select__chevron" />
        </button>
        <ul id={listId} role="listbox" className="select__listbox" hidden={!open} tabIndex={-1}>
          {options.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              className={cx('select__option', index === activeIndex && 'select__option--active')}
              aria-selected={index === selectedIndex}
              aria-disabled={option.disabled || undefined}
              // Keep focus on the trigger so its blur doesn't close the list first.
              onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => !option.disabled && activeIndex !== index && setActiveIndex(index)}
              onClick={() => choose(index)}
            >
              <span>{option.label}</span>
              {index === selectedIndex && <Icon name="check" />}
            </li>
          ))}
        </ul>
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
