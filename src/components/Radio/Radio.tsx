import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, className, style, ...rest },
  ref,
) {
  return (
    <label className={cx('choice', 'radio', className)} style={style}>
      <input ref={ref} type="radio" className="choice__input" {...rest} />
      <span className="choice__control" aria-hidden="true" />
      {label && <span className="choice__label">{label}</span>}
    </label>
  );
});
