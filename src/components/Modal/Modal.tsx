import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type DialogHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'title'> {
  open: boolean;
  /** Called when the user asks to close: the × button, Escape or a backdrop click. */
  onClose?: () => void;
  /**
   * Whether the user can close the modal without choosing an action. When false there is
   * no × button and Escape and backdrop clicks are ignored. Defaults to true.
   */
  dismissible?: boolean;
  title?: ReactNode;
  /** Text below the title, also read out as the dialog's description. */
  description?: ReactNode;
  /** Actions at the bottom, usually buttons. */
  footer?: ReactNode;
  /** Max width: `sm` 400px, `md` 520px, `lg` 720px. Defaults to `md`. */
  size?: ModalSize;
  /** Accessible name of the × button. Defaults to "Close". */
  closeLabel?: string;
}

export const Modal = forwardRef<HTMLDialogElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    dismissible = true,
    title,
    description,
    footer,
    size = 'md',
    closeLabel = 'Close',
    className,
    children,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const titleId = `${autoId}-title`;
  const descriptionId = `${autoId}-description`;
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Only a press that starts and ends on the backdrop closes, not a drag out of the panel.
  const pressedBackdrop = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // The browser focuses the first control, which shows its focus ring even on a mouse
      // open. Start on the panel instead, unless something asks for focus.
      const target = dialog.querySelector<HTMLElement>('[data-autofocus]') ?? panelRef.current;
      target?.focus({ preventScroll: true });
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const requestClose = () => {
    if (dismissible) onClose?.();
  };

  return (
    <dialog
      ref={(node) => {
        dialogRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cx('modal', `modal--${size}`, className)}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      // `open` stays in sync with the prop: the dialog never closes itself.
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onKeyDown={(event) => {
        // Stops the browser's own close request, which some browsers
        // honor on a second Escape even when `cancel` is prevented.
        if (event.key === 'Escape' && !dismissible) event.preventDefault();
      }}
      onPointerDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedBackdrop.current && event.target === event.currentTarget) requestClose();
        pressedBackdrop.current = false;
      }}
      {...rest}
    >
      <div ref={panelRef} className="modal__panel" tabIndex={-1}>
        {(title || description || dismissible) && (
          <header className={cx('modal__header', !title && !description && 'modal__header--bare')}>
            <div className="modal__heading">
              {title && (
                <h2 id={titleId} className="modal__title">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="modal__description">
                  {description}
                </p>
              )}
            </div>
            {dismissible && (
              <button type="button" className="modal__close" onClick={onClose} aria-label={closeLabel}>
                <Icon name="close" />
              </button>
            )}
          </header>
        )}
        {children && <div className="modal__body">{children}</div>}
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </dialog>
  );
});
