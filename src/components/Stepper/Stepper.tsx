import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface StepperStep {
  label: ReactNode;
}

export interface StepperProps extends HTMLAttributes<HTMLOListElement> {
  steps: StepperStep[];
  /** Index of the current step (0-based). Steps before it show as completed. */
  current: number;
  /** Makes completed steps clickable, e.g. to go back and edit them. */
  onStepClick?: (index: number) => void;
  /** Defaults to `horizontal`. */
  orientation?: 'horizontal' | 'vertical';
}

export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, current, onStepClick, orientation = 'horizontal', className, ...rest },
  ref,
) {
  return (
    <ol ref={ref} className={cx('stepper', `stepper--${orientation}`, className)} {...rest}>
      {steps.map((step, index) => {
        const status = index < current ? 'complete' : index === current ? 'current' : 'upcoming';
        const content = (
          <>
            <span className="stepper__indicator">
              {status === 'complete' ? <Icon name="check" label="Completed" /> : index + 1}
            </span>
            <span className="stepper__text">
              <span className="stepper__label">{step.label}</span>
            </span>
          </>
        );

        return (
          <li
            key={index}
            className={cx('stepper__step', `stepper__step--${status}`)}
            aria-current={status === 'current' ? 'step' : undefined}
          >
            {status === 'complete' && onStepClick ? (
              <button type="button" className="stepper__content" onClick={() => onStepClick(index)}>
                {content}
              </button>
            ) : (
              <div className="stepper__content">{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
});
