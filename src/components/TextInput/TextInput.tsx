import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import type { IconName } from '../../icons/generated/icon-names';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label. If omitted, pass `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
  /** Hint shown below the field. Replaced by `error` when that is a string. */
  helperText?: ReactNode;
  /** Error state. A string is also shown as the message below the field. */
  error?: boolean | string;
  /** Valid state — shows a check at the end of the field. */
  success?: boolean;
  iconStart?: IconName;
  iconEnd?: IconName;
  /** Class for the outer wrapper; `className` goes on the <input>. */
  wrapperClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    label,
    helperText,
    error,
    success,
    iconStart,
    iconEnd,
    wrapperClassName,
    className,
    id,
    type = 'text',
    disabled,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === 'password';
  const hasError = Boolean(error);
  const message = typeof error === 'string' && error ? error : helperText;
  const endIcon = iconEnd ?? (success && !hasError ? 'check' : undefined);

  return (
    <div
      className={cx(
        'field',
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
      <div className="field__control">
        {iconStart && <Icon name={iconStart} />}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && revealed ? 'text' : type}
          disabled={disabled}
          className={cx('field__input', className)}
          aria-invalid={hasError || undefined}
          aria-describedby={message ? messageId : undefined}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            className="field__reveal"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            disabled={disabled}
          >
            <Icon name="eye" />
          </button>
        ) : (
          endIcon && <Icon name={endIcon} />
        )}
      </div>
      {message && (
        <p id={messageId} className="field__message">
          {message}
        </p>
      )}
    </div>
  );
});
