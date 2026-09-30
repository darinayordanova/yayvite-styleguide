import { forwardRef, type HTMLAttributes } from 'react';
import type { IconName } from '../../icons/generated/icon-names';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export type BadgeTone = 'neutral' | 'evergreen' | 'rose' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Color. Status tones (`success`, `warning`, `error`, `info`) for states; the rest for categories. Defaults to `neutral`. */
  tone?: BadgeTone;
  /** Shows a small dot before the text. */
  dot?: boolean;
  /** Icon shown before the text. */
  icon?: IconName;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'neutral', dot, icon, className, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx('badge', `badge--${tone}`, className)} {...rest}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
});
