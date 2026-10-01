import {
  forwardRef,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from '../../utils/cx';
import { setRef } from '../../utils/setRef';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label. If omitted, pass `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
  /** Hint shown below the field. Replaced by `error` when that is a string. */
  helperText?: ReactNode;
  /** Error state. A string is also shown as the message below the field. */
  error?: boolean | string;
  /** Visible lines of text. With `autoResize` this is the minimum height. Defaults to 4. */
  rows?: number;
  /** Grows with its content from `rows` up to `maxRows` lines, then scrolls. */
  autoResize?: boolean;
  /** Maximum height in lines when `autoResize` is on. Unlimited if omitted. */
  maxRows?: number;
  /** Shows a character count below the field, out of `maxLength` when that is set. */
  showCount?: boolean;
  /** Class for the outer wrapper; `className` goes on the <textarea>. */
  wrapperClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label,
    helperText,
    error,
    rows = 4,
    autoResize,
    maxRows,
    showCount,
    maxLength,
    wrapperClassName,
    className,
    id,
    disabled,
    value,
    defaultValue,
    onChange,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const countId = `${inputId}-count`;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Tracked for the counter when the field is uncontrolled.
  const [innerLength, setInnerLength] = useState(() => String(defaultValue ?? '').length);
  const length = value !== undefined ? String(value).length : innerLength;

  const hasError = Boolean(error);
  const message = typeof error === 'string' && error ? error : helperText;

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!autoResize || !textarea) return;
    // The textarea is border-box, and `scrollHeight` already includes its padding.
    const style = getComputedStyle(textarea);
    const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const max = maxRows ? parseFloat(style.lineHeight) * maxRows + padding + borders : Infinity;

    // `auto` falls back to the `rows` height, so the field never shrinks below it.
    textarea.style.height = 'auto';
    const needed = textarea.scrollHeight + borders;
    textarea.style.height = `${Math.min(needed, max)}px`;
    textarea.style.overflowY = needed > max ? 'auto' : 'hidden';
  }, [autoResize, maxRows]);

  useLayoutEffect(resize, [resize, value]);

  return (
    <div
      className={cx(
        'field',
        'textarea',
        hasError && 'field--error',
        disabled && 'field--disabled',
        wrapperClassName,
      )}
    >
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="field__control textarea__control">
        <textarea
          ref={(node) => {
            textareaRef.current = node;
            setRef(ref, node);
          }}
          id={inputId}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          className={cx('field__input', 'textarea__input', autoResize && 'textarea__input--auto', className)}
          aria-invalid={hasError || undefined}
          aria-describedby={cx(Boolean(message) && messageId, showCount && countId) || undefined}
          onChange={(event) => {
            setInnerLength(event.target.value.length);
            resize();
            onChange?.(event);
          }}
          {...rest}
        />
      </div>
      {(message || showCount) && (
        <div className="textarea__footer">
          {message && (
            <p id={messageId} className="field__message">
              {message}
            </p>
          )}
          {showCount && (
            <span
              id={countId}
              className={cx(
                'textarea__count',
                maxLength !== undefined && length >= maxLength && 'textarea__count--limit',
              )}
            >
              {maxLength !== undefined ? `${length} / ${maxLength}` : length}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
