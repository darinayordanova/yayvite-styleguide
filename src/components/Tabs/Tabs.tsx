import {
  forwardRef,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import type { IconName } from '../../icons/generated/icon-names';
import { cx } from '../../utils/cx';
import { useIndicator } from '../../utils/useIndicator';
import { Icon } from '../Icon/Icon';

export interface TabItem {
  value: string;
  label: ReactNode;
  icon?: IconName;
  disabled?: boolean;
  /** Panel shown while this tab is selected. Leave out to render panels yourself. */
  content?: ReactNode;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  items: TabItem[];
  /** Selected tab's `value` (controlled). */
  value?: string;
  /** Initially selected tab's `value` (uncontrolled). Defaults to the first enabled tab. */
  defaultValue?: string;
  /** Called with the `value` of the newly selected tab. */
  onChange?: (value: string) => void;
  /** Stretches the tabs to share the full width equally. */
  fullWidth?: boolean;
}

/** Tabs with an underline that slides to the selected tab. Arrow keys, Home and End move between tabs. */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    items,
    value,
    defaultValue,
    onChange,
    fullWidth,
    className,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const [innerValue, setInnerValue] = useState(
    () => defaultValue ?? items.find((item) => !item.disabled)?.value,
  );
  const selected = value !== undefined ? value : innerValue;
  const selectedItem = items.find((item) => item.value === selected);

  const listRef = useRef<HTMLDivElement>(null);
  const indicator = useIndicator(listRef, selected);

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = (index: number) => `${baseId}-panel-${index}`;
  const selectedIndex = items.findIndex((item) => item.value === selected);

  const select = (item: TabItem) => {
    if (item.disabled || item.value === selected) return;
    if (value === undefined) setInnerValue(item.value);
    onChange?.(item.value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabled = items.map((item, index) => ({ item, index })).filter(({ item }) => !item.disabled);
    if (!enabled.length) return;
    const current = enabled.findIndex(({ index }) => index === selectedIndex);
    let next: number;

    switch (event.key) {
      case 'ArrowLeft':
        next = current <= 0 ? enabled.length - 1 : current - 1;
        break;
      case 'ArrowRight':
        next = current === enabled.length - 1 ? 0 : current + 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = enabled.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const target = enabled[next];
    select(target.item);
    const tab = document.getElementById(tabId(target.index));
    tab?.focus();
    tab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  return (
    <div ref={ref} id={id} className={cx('tabs', fullWidth && 'tabs--full', className)} {...rest}>
      <div
        ref={listRef}
        role="tablist"
        className="tabs__list"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onKeyDown={onKeyDown}
      >
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.value}
              id={tabId(index)}
              type="button"
              role="tab"
              className="tabs__tab"
              aria-selected={isSelected}
              aria-controls={isSelected && item.content !== undefined ? panelId(index) : undefined}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              data-active={isSelected || undefined}
              onClick={() => select(item)}
            >
              {item.icon && <Icon name={item.icon} />}
              {item.label}
            </button>
          );
        })}
        <span
          className={cx('tabs__indicator', indicator.ready && 'tabs__indicator--animated')}
          style={indicator.style}
          hidden={!indicator.visible}
          aria-hidden="true"
        />
      </div>
      {selectedItem?.content !== undefined && (
        <div
          id={panelId(selectedIndex)}
          role="tabpanel"
          className="tabs__panel"
          aria-labelledby={tabId(selectedIndex)}
          tabIndex={0}
        >
          {selectedItem.content}
        </div>
      )}
    </div>
  );
});
