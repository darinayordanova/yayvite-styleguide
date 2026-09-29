import { ClassChip } from './CopyButton';

/** [class name, the CSS it applies] */
export type ClassRow = [name: string, css: string];

/** Utility classes as a grid of cards: the copyable class name with its CSS underneath. */
export function ClassGrid({ rows }: { rows: ClassRow[] }) {
  return (
    <div className="grid grid-cols-1 sm-grid-cols-2 lg-grid-cols-3 xl-grid-cols-4 gap-3">
      {rows.map(([name, css]) => (
        <div key={name} className="border border-neutral-100 rounded-md py-2 px-3 min-w-0">
          <ClassChip name={name} />
          <code
            className="block text-neutral-500 truncate mt-1"
            style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11 }}
            title={css}
          >
            {css}
          </code>
        </div>
      ))}
    </div>
  );
}
