import { forwardRef, type ButtonHTMLAttributes } from 'react';
import type { IconName } from '../../icons/generated/icon-names';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconName;
  'aria-label': string;
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
