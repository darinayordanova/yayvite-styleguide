import { forwardRef, type HTMLAttributes } from 'react';
import type { IconName } from '../../icons/generated/icon-names';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export type PillTone = 'evergreen' | 'rose' | 'neutral' | 'success' | 'warning' | 'error' | 'info';

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  /** Color. Status tones (`success`, `warning`, `error`, `info`) for states; the rest for categories. Defaults to `evergreen`. */
  tone?: PillTone;
  /** Icon shown before the text. */
  icon?: IconName;
  /** Shows a remove (×) button that calls this when clicked. */
  onRemove?: () => void;
  /** Accessible name of the remove button. Defaults to "Remove {text}". */
  removeLabel?: string;
  /** Disables the remove button and dims the pill. */
  disabled?: boolean;
}

export const Pill = forwardRef<HTMLSpanElement, PillProps>(function Pill(
  { tone = 'evergreen', icon, onRemove, removeLabel, disabled, className, children, ...rest },
  ref,
) {
  const label = removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove');

  return (
    <span
      ref={ref}
      className={cx(
        'pill',
        `pill--${tone}`,
        onRemove && 'pill--removable',
        disabled && 'pill--disabled',
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} />}
      <span className="pill__label">{children}</span>
      {onRemove && (
        <button
          type="button"
          className="pill__remove"
          onClick={onRemove}
          disabled={disabled}
          aria-label={label}
        >
          <Icon name="close" />
        </button>
      )}
    </span>
  );
});
