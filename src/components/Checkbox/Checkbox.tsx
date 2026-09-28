import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, style, ...rest },
  ref,
) {
  return (
    <label className={cx('choice', 'checkbox', className)} style={style}>
      <input ref={ref} type="checkbox" className="choice__input" {...rest} />
      <span className="choice__control" aria-hidden="true" />
      {label && <span className="choice__label">{label}</span>}
    </label>
  );
});
