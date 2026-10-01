import { forwardRef, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import type { IconName } from '../../icons/generated/icon-names';
import { cx } from '../../utils/cx';
import { setRef } from '../../utils/setRef';
import { useIndicator } from '../../utils/useIndicator';
import { Icon } from '../Icon/Icon';

export type SegmentedControlSize = 'sm' | 'md' | 'lg';

export interface SegmentedControlOption {
  value: string;
  label?: ReactNode;
  icon?: IconName;
  disabled?: boolean;
  /** Accessible name. Required when the option has only an icon. */
  'aria-label'?: string;
}

export interface SegmentedControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: SegmentedControlOption[];
  /** Selected option's `value` (controlled). */
  value?: string;
  /** Initially selected option's `value` (uncontrolled). Defaults to the first enabled option. */
  defaultValue?: string;
  /** Called with the `value` of the newly selected option. */
  onChange?: (value: string) => void;
  /** Height: `sm` 32px, `md` 40px, `lg` 48px. Defaults to `md`. */
  size?: SegmentedControlSize;
  /** Form field name. Defaults to a generated one. */
  name?: string;
  disabled?: boolean;
  /** Stretches the options to share the full width equally. */
  fullWidth?: boolean;
}

/**
 * A row of mutually exclusive options with a thumb that slides to the selected one.
 * Built on native radio buttons, so arrow keys and forms work as usual.
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl(
    {
      options,
      value,
      defaultValue,
      onChange,
      size = 'md',
      name,
      disabled,
      fullWidth,
      className,
      ...rest
    },
    ref,
  ) {
    const autoName = useId();
    const [innerValue, setInnerValue] = useState(
      () => defaultValue ?? options.find((option) => !option.disabled)?.value,
    );
    const selected = value !== undefined ? value : innerValue;

    const rootRef = useRef<HTMLDivElement | null>(null);
    const indicator = useIndicator(rootRef, selected);

    return (
      <div
        ref={(node) => {
          rootRef.current = node;
          setRef(ref, node);
        }}
        role="radiogroup"
        aria-disabled={disabled || undefined}
        className={cx(
          'segmented',
          `segmented--${size}`,
          fullWidth && 'segmented--full',
          disabled && 'segmented--disabled',
          className,
        )}
        {...rest}
      >
        <span
          className={cx('segmented__thumb', indicator.ready && 'segmented__thumb--animated')}
          style={indicator.style}
          hidden={!indicator.visible}
          aria-hidden="true"
        />
        {options.map((option) => {
          const isSelected = option.value === selected;
          return (
            <label
              key={option.value}
              className={cx('segmented__option', !option.label && 'segmented__option--icon')}
              data-active={isSelected || undefined}
            >
              <input
                type="radio"
                className="segmented__input"
                name={name ?? autoName}
                value={option.value}
                checked={isSelected}
                disabled={disabled || option.disabled}
                aria-label={option['aria-label']}
                onChange={() => {
                  if (value === undefined) setInnerValue(option.value);
                  onChange?.(option.value);
                }}
              />
              <span className="segmented__label">
                {option.icon && <Icon name={option.icon} />}
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    );
  },
);
