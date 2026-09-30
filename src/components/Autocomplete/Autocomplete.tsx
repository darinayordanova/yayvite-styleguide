import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import type { IconName } from '../../icons/generated/icon-names';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';
import type { SelectOption } from '../Select/Select';

export interface AutocompleteProps {
  options: SelectOption[];
  /** Selected option value (controlled). Empty string when nothing is selected. */
  value?: string;
  /** Initially selected option value (uncontrolled). */
  defaultValue?: string;
  /** Called with the chosen option's value, or an empty string when cleared. */
  onChange?: (value: string) => void;
  /** Called with the text as the user types — use it to load `options` remotely. */
  onInputChange?: (text: string) => void;
  /**
   * Decides whether an option matches the typed text. Defaults to a
   * case-insensitive "label contains text" match. Pass `false` when `options`
   * are already filtered, e.g. by a server.
   */
  filter?: false | ((option: SelectOption, text: string) => boolean);
  /** Shows `loadingText` instead of `noOptionsText` while there are no options. */
  loading?: boolean;
  /** Defaults to "Loading…". */
  loadingText?: ReactNode;
  /** Shown when nothing matches the typed text. Defaults to "No results". */
  noOptionsText?: ReactNode;
  /** Visible label. If omitted, pass `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
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

const matchesLabel = (option: SelectOption, text: string) =>
  option.label.toLowerCase().includes(text.trim().toLowerCase());

export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(function Autocomplete(
  {
    options,
    value,
    defaultValue,
    onChange,
    onInputChange,
    filter = matchesLabel,
    loading,
    loadingText = 'Loading…',
    noOptionsText = 'No results',
    label,
    placeholder,
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
  const inputId = id ?? autoId;
  const listId = `${inputId}-listbox`;
  const messageId = `${inputId}-message`;
  const optionId = (index: number) => `${inputId}-option-${index}`;

  const [innerValue, setInnerValue] = useState(defaultValue);
  const selectedValue = value !== undefined ? value : innerValue;
  // Remembers the chosen option, which remote `options` may no longer include.
  const chosen = useRef<SelectOption | undefined>(undefined);
  const selected =
    options.find((o) => o.value === selectedValue) ??
    (chosen.current?.value === selectedValue ? chosen.current : undefined);
  const selectedLabel = selected?.label ?? '';

  const [text, setText] = useState(selectedLabel);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const hasError = Boolean(error);
  const message = typeof error === 'string' && error ? error : helperText;

  // The untouched label of the current selection shows every option, so
  // reopening the list lets the user pick a different one.
  const visibleFor = (query: string) =>
    filter === false || query === selectedLabel ? options : options.filter((o) => filter(o, query));

  const visible = visibleFor(text);
  const enabledIndexes = visible.flatMap((o, i) => (o.disabled ? [] : [i]));
  const first = enabledIndexes[0] ?? -1;
  const last = enabledIndexes[enabledIndexes.length - 1] ?? -1;
  const selectedIndex = visible.findIndex((o) => o.value === selectedValue);
  const initial = selectedIndex >= 0 && !visible[selectedIndex].disabled ? selectedIndex : first;

  const listOpen = open && visible.length > 0;
  const statusOpen = open && visible.length === 0 && (loading || text !== '');

  const openAt = (index: number) => {
    setOpen(true);
    setActiveIndex(index);
  };

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const commit = (next: string) => {
    if (value === undefined) setInnerValue(next);
    if (next !== (selectedValue ?? '')) onChange?.(next);
  };

  const choose = (index: number) => {
    const option = visible[index];
    if (!option || option.disabled) return;
    chosen.current = option;
    setText(option.label);
    commit(option.value);
    close();
  };

  const type = (next: string) => {
    setText(next);
    onInputChange?.(next);
    // Emptying the field clears the selection; other edits keep it until
    // another option is chosen.
    if (next === '') commit('');
  };

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    type(next);
    openAt(visibleFor(next).findIndex((o) => !o.disabled));
  };

  // Next enabled option in `direction` from `from`, clamped to the ends.
  const step = (from: number, direction: 1 | -1) => {
    const candidates = direction === 1 ? enabledIndexes : [...enabledIndexes].reverse();
    return candidates.find((i) => (direction === 1 ? i > from : i < from)) ?? from;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) openAt(initial);
        else setActiveIndex((i) => (i < 0 ? first : step(i, 1)));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) openAt(initial);
        else if (event.altKey) close();
        else setActiveIndex((i) => (i < 0 ? last : step(i, -1)));
        break;
      case 'Enter':
        // Without an active option, Enter submits the surrounding form as usual.
        if (open && visible[activeIndex]) {
          event.preventDefault();
          choose(activeIndex);
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          close();
        }
        break;
    }
  };

  // Text that wasn't turned into a choice is dropped on leaving the field.
  const onBlur = () => {
    close();
    setText(selectedLabel);
  };

  // Follow selection changes made from outside.
  useEffect(() => {
    setText(selectedLabel);
  }, [selectedValue]);

  // Keep the active option in view while navigating with the keyboard.
  useEffect(() => {
    if (open && activeIndex >= 0) {
      document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, activeIndex]);

  return (
    <div
      className={cx(
        'field',
        'autocomplete',
        hasError && 'field--error',
        disabled && 'field--disabled',
        className,
      )}
    >
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="select__anchor">
        <div className="field__control">
          {iconStart && <Icon name={iconStart} />}
          <input
            ref={ref}
            id={inputId}
            type="text"
            role="combobox"
            className="field__input"
            value={text}
            placeholder={placeholder}
            autoComplete="off"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={listOpen}
            aria-controls={listId}
            aria-activedescendant={listOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-invalid={hasError || undefined}
            aria-required={required || undefined}
            aria-describedby={message ? messageId : undefined}
            disabled={disabled}
            onChange={onInput}
            onClick={() => !open && openAt(initial)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
          />
          {text && !disabled && (
            <button
              type="button"
              className="autocomplete__clear"
              aria-label="Clear"
              tabIndex={-1}
              // Keep focus on the input so its blur doesn't restore the text first.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => type('')}
            >
              <Icon name="close" />
            </button>
          )}
        </div>
        <ul id={listId} role="listbox" className="select__listbox" hidden={!listOpen} tabIndex={-1}>
          {visible.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              className={cx('select__option', index === activeIndex && 'select__option--active')}
              aria-selected={index === selectedIndex}
              aria-disabled={option.disabled || undefined}
              // Keep focus on the input so its blur doesn't close the list first.
              onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => !option.disabled && activeIndex !== index && setActiveIndex(index)}
              onClick={() => choose(index)}
            >
              <span>{option.label}</span>
              {index === selectedIndex && <Icon name="check" />}
            </li>
          ))}
        </ul>
        {statusOpen && (
          <div className="select__listbox autocomplete__status" role="status">
            {loading ? loadingText : noOptionsText}
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
