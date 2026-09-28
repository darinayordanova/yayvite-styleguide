import { forwardRef, type ButtonHTMLAttributes } from 'react';
import type { IconName } from '../../icons/generated/icon-names';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Icon shown in the button. */
  icon: IconName;
  /** Accessible name, read by screen readers. Required because the button has no visible text. */
  'aria-label': string;
  /** Button size: `sm` 32px, `md` 40px, `lg` 48px. Defaults to `md`. */
  size?: IconButtonSize;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, size = 'md', type = 'button', className, ...rest },
  ref,
) {
  
  return (
    <button
      ref={ref}
      type={type}
      className={cx('icon-btn', `icon-btn--${size}`, className)}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
});
