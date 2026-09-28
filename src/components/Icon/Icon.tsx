import { forwardRef, type HTMLAttributes } from 'react';
import type { IconName } from '../../icons/generated/icon-names';
import { cx } from '../../utils/cx';

export type IconSize = 16 | 20 | 24 | 32;

export interface IconProps extends HTMLAttributes<HTMLElement> {
  /** Which icon to show from the icon font. */
  name: IconName;
  /** Pixel size. Omit to inherit the size set by the parent component. */
  size?: IconSize;
  /** Accessible name. Without it the icon is treated as decorative. */
  label?: string;
}

export const Icon = forwardRef<HTMLElement, IconProps>(function Icon(
  { name, size, label, className, ...rest },
  ref,
) {
  
  return (
    <i
      ref={ref}
      className={cx('icon', `icon-${name}`, size && `icon-${size}`, className)}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      {...rest}
    />
  );
});
