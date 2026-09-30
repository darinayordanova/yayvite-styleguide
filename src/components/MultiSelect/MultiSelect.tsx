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
import { Pill } from '../Pill/Pill';
import type { SelectOption } from '../Select/Select';

export interface MultiSelectProps {
  options: SelectOption[];
  /** Selected values (controlled). */
  value?: string[];
  /** Initially selected values (uncontrolled). */
  defaultValue?: string[];
  /** Called with the selected values, in the order of `options`. */
  onChange?: (value: string[]) => void;
  /** Visible label. If omitted, pass `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
  /** Shown when nothing is selected. Defaults to "Select options". */
  placeholder?: string;
  /** Hint shown below the field. Replaced by `error` when that is a string. */
  helperText?: ReactNode;
  /** Error state. A string is also shown as the message below the field. */
  error?: boolean | string;
  iconStart?: IconName;
  disabled?: boolean;
  required?: boolean;
  /** Form field name. Each selected value is submitted through a hidden input. */
  name?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** Class for the outer wrapper. */
  className?: string;
}

const TYPEAHEAD_RESET_MS = 500;

export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(function MultiSelect(
  {
    options,
    value,
    defaultValue,
    onChange,
    label,
    placeholder = 'Select options',
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

  const [innerValue, setInnerValue] = useState(defaultValue ?? []);
  const selectedValues = value !== undefined ? value : innerValue;
  const isSelected = (option: SelectOption) => selectedValues.includes(option.value);
  const selectedOptions = options.filter(isSelected);

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

  const commit = (next: string[]) => {
    if (value === undefined) setInnerValue(next);
    onChange?.(next);
  };

  // Toggles the option and keeps the list open for further picks.
  const toggle = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    const keep = (o: SelectOption) => (o === option ? !isSelected(o) : isSelected(o));
    commit(options.filter(keep).map((o) => o.value));
  };

  const removeLast = () => {
    const removable = selectedOptions.filter((o) => !o.disabled).pop();
    if (removable) commit(selectedValues.filter((v) => v !== removable.value));
  };

  // Next enabled option in `direction` from `from`, clamped to the ends.
  const step = (from: number, direction: 1 | -1) => {
    const candidates = direction === 1 ? enabledIndexes : [...enabledIndexes].reverse();
    return candidates.find((i) => (direction === 1 ? i > from : i < from)) ?? from;
  };

  const first = enabledIndexes[0] ?? -1;
  const last = enabledIndexes[enabledIndexes.length - 1] ?? -1;
  const initial = enabledIndexes.find((i) => isSelected(options[i])) ?? first;

  const findByText = (key: string) => {
    const t = typeahead.current;
    window.clearTimeout(t.timer);
    t.text += key.toLowerCase();
    t.timer = window.setTimeout(() => (t.text = ''), TYPEAHEAD_RESET_MS);

    // Search from the option after the current one, wrapping around, so
    // pressing the same letter repeatedly cycles through matches.
    const ordered = [
      ...enabledIndexes.filter((i) => i > activeIndex),
      ...enabledIndexes.filter((i) => i <= activeIndex),
    ];
    const matchesAll = (s: string) => ordered.find((i) => options[i].label.toLowerCase().startsWith(s));
    const repeated = t.text.split('').every((c) => c === t.text[0]);
    return matchesAll(t.text) ?? (repeated ? matchesAll(t.text[0]) : undefined);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const { key } = event;
    const isCharacter = key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;

    if (key === 'Backspace') {
      removeLast();
      return;
    }

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
      } else if (isCharacter) {
        const match = findByText(key);
        if (match !== undefined) openAt(match);
      }
      return;
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((i) => step(i, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (event.altKey) close();
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
        toggle(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      default:
        if (isCharacter) {
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
        'multi-select',
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
          className="field__control select__trigger multi-select__trigger"
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
          {selectedOptions.length > 0 ? (
            <span className="multi-select__values">
              {selectedOptions.map((option) => (
                <Pill key={option.value} disabled={disabled}>
                  {option.label}
                </Pill>
              ))}
            </span>
          ) : (
            <span className="select__value select__value--placeholder">{placeholder}</span>
          )}
          <Icon name="chevron" className="select__chevron" />
        </button>
        <ul
          id={listId}
          role="listbox"
          className="select__listbox"
          aria-multiselectable="true"
          hidden={!open}
          tabIndex={-1}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              className={cx(
                'select__option',
                'multi-select__option',
                index === activeIndex && 'select__option--active',
              )}
              aria-selected={isSelected(option)}
              aria-disabled={option.disabled || undefined}
              // Keep focus on the trigger so its blur doesn't close the list first.
              onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => !option.disabled && activeIndex !== index && setActiveIndex(index)}
              onClick={() => toggle(index)}
            >
              <span className="multi-select__check" aria-hidden="true">
                {isSelected(option) && <Icon name="check" />}
              </span>
              <span>{option.label}</span>
            </li>
          ))}
        </ul>
      </div>
      {name && selectedValues.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      {message && (
        <p id={messageId} className="field__message">
          {message}
        </p>
      )}
    </div>
  );
});
