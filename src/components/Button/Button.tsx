import { forwardRef, type ButtonHTMLAttributes } from 'react';
import type { IconName } from '../../icons/generated/icon-names';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style: primary for the main action, destructive for irreversible ones. Defaults to `primary`. */
  variant?: ButtonVariant;
  /** Height: `sm` 32px, `md` 40px, `lg` 48px. Defaults to `md`. */
  size?: ButtonSize;
  /** Icon shown before the label. */
  iconStart?: IconName;
  /** Icon shown after the label. */
  iconEnd?: IconName;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', iconStart, iconEnd, type = 'button', className, children, ...rest },
  ref,
) {
  
  return (
    <button
      ref={ref}
      type={type}
      className={cx('btn', `btn--${variant}`, `btn--${size}`, className)}
      {...rest}
    >
      {iconStart && <Icon name={iconStart} />}
      {children}
      {iconEnd && <Icon name={iconEnd} />}
    </button>
  );
});
