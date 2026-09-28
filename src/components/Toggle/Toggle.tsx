import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: ReactNode;
}

/** An on/off switch. Uses a native checkbox with role="switch". */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { label, description, className, style, id, ...rest },
  ref,
) {
  const autoId = useId();
  const descriptionId = description ? `${id ?? autoId}-description` : undefined;

  return (
    <label className={cx('choice', 'toggle', className)} style={style}>
      {(label || description) && (
        <span className="toggle__text">
          {label && <span className="toggle__label">{label}</span>}
          {description && (
            <span id={descriptionId} className="toggle__description">
              {description}
            </span>
          )}
        </span>
      )}
      <input
        ref={ref}
        id={id}
        type="checkbox"
        role="switch"
        className="choice__input"
        aria-describedby={descriptionId}
        {...rest}
      />
      <span className="choice__control" aria-hidden="true" />
    </label>
  );
});
