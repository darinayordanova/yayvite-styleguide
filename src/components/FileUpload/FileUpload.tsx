import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export type FileRejectionReason = 'type' | 'size' | 'count';

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
}

export interface FileUploadProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange'> {
  /** Visible label. If omitted, pass `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
  /** Main text inside the drop area. */
  prompt?: ReactNode;
  /** Hint inside the drop area, e.g. accepted formats and size. */
  helperText?: ReactNode;
  /** Error state. A string is also shown as the message below the drop area. */
  error?: boolean | string;
  /** Accepted types, like the native `accept`. Defaults to images and videos. */
  accept?: string;
  /** Largest allowed file, in bytes. */
  maxSize?: number;
  /** Most files allowed when `multiple` is set. */
  maxFiles?: number;
  /** Selected files (controlled). */
  files?: File[];
  /** Called with the full list whenever files are added or removed. */
  onFilesChange?: (files: File[]) => void;
  /** Called with files that were skipped for type, size or count. */
  onReject?: (rejections: FileRejection[]) => void;
  /** Class for the outer wrapper; `className` goes on the drop area. */
  wrapperClassName?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${Number(value.toFixed(value < 10 ? 1 : 0))} ${units[unit]}`;
}

// Same rules as the native `accept` attribute, which drag and drop bypasses.
function matchesAccept(file: File, accept: string): boolean {
  const rules = accept.split(',').map((r) => r.trim().toLowerCase()).filter(Boolean);
  if (rules.length === 0) return true;
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return rules.some((rule) =>
    rule.startsWith('.')
      ? name.endsWith(rule)
      : rule.endsWith('/*')
        ? type.startsWith(rule.slice(0, -1))
        : type === rule,
  );
}

function rejectionMessage({ file, reason }: FileRejection, maxSize?: number, maxFiles?: number) {
  if (reason === 'type') return `${file.name} isn't a supported file type`;
  if (reason === 'size') return `${file.name} is larger than ${formatBytes(maxSize ?? 0)}`;
  return `You can add up to ${maxFiles} ${maxFiles === 1 ? 'file' : 'files'}`;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(function FileUpload(
  {
    label,
    prompt,
    helperText,
    error,
    accept = 'image/*,video/*',
    maxSize,
    maxFiles,
    multiple,
    files: filesProp,
    onFilesChange,
    onReject,
    disabled,
    wrapperClassName,
    className,
    id,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const labelId = `${inputId}-label`;
  const hintId = `${inputId}-hint`;
  const messageId = `${inputId}-message`;

  const [innerFiles, setInnerFiles] = useState<File[]>([]);
  const files = filesProp ?? innerFiles;
  const [rejection, setRejection] = useState<string>();
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState(new Map<File, string>());
  const inputRef = useRef<HTMLInputElement | null>(null);

  const limit = multiple ? (maxFiles ?? Infinity) : 1;
  const hasError = Boolean(error) || Boolean(rejection);
  const message = typeof error === 'string' && error ? error : rejection;

  const update = (next: File[]) => {
    if (filesProp === undefined) setInnerFiles(next);
    onFilesChange?.(next);
  };

  const addFiles = (list: FileList | null) => {
    if (!list || disabled) return;
    const rejected: FileRejection[] = [];
    // A single-file upload replaces the current file instead of adding to it.
    const next = multiple ? [...files] : [];
    for (const file of Array.from(list)) {
      if (!matchesAccept(file, accept)) rejected.push({ file, reason: 'type' });
      else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: 'size' });
      else if (next.length >= limit) rejected.push({ file, reason: 'count' });
      else next.push(file);
    }
    setRejection(rejected[0] && rejectionMessage(rejected[0], maxSize, maxFiles));
    if (rejected.length) onReject?.(rejected);
    if (next.length !== files.length || next.some((f, i) => f !== files[i])) update(next);
  };

  const removeFile = (index: number) => {
    setRejection(undefined);
    update(files.filter((_, i) => i !== index));
  };

  // Mirror the list into the native input so it submits with a regular form.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
  }, [files]);

  // Object URLs for thumbnails, released when the list changes or on unmount.
  useEffect(() => {
    const urls = new Map(
      files
        .filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
        .map((f) => [f, URL.createObjectURL(f)] as const),
    );
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (!disabled) setDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  return (
    <div
      className={cx(
        'field',
        'upload',
        hasError && 'field--error',
        disabled && 'field--disabled',
        wrapperClassName,
      )}
    >
      {label && (
        <label id={labelId} className="field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <label
        className={cx('upload__dropzone', dragging && 'upload__dropzone--dragging', className)}
        onDragEnter={onDragOver}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          id={inputId}
          type="file"
          className="upload__input"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={cx(Boolean(helperText) && hintId, Boolean(message) && messageId) || undefined}
          aria-invalid={hasError || undefined}
          onChange={(event) => addFiles(event.target.files)}
          {...rest}
        />
        <span className="upload__icon">
          <Icon name="upload" />
        </span>
        <span className="upload__prompt">
          {prompt ?? (
            <>
              <strong>Click to upload</strong> or drag and drop
            </>
          )}
        </span>
        {helperText && (
          <span id={hintId} className="upload__hint">
            {helperText}
          </span>
        )}
      </label>
      {message && (
        <p id={messageId} className="field__message" role="alert">
          {message}
        </p>
      )}
      {files.length > 0 && (
        <ul className="upload__list">
          {files.map((file, index) => {
            const url = previews.get(file);
            const isVideo = file.type.startsWith('video/');
            return (
              <li key={`${file.name}-${file.lastModified}-${index}`} className="upload__item">
                <div className="upload__thumb">
                  {url && isVideo && <video src={url} muted playsInline preload="metadata" />}
                  {url && !isVideo && <img src={url} alt="" />}
                  {!url && <Icon name="paper" />}
                  {isVideo && (
                    <span className="upload__kind">
                      <Icon name="video" />
                    </span>
                  )}
                </div>
                <span className="upload__name" title={file.name}>
                  {file.name}
                </span>
                <span className="upload__size">{formatBytes(file.size)}</span>
                <button
                  type="button"
                  className="upload__remove"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                >
                  <Icon name="close" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
