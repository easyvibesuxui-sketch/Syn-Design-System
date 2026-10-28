import type { ReactNode } from 'react';
import { cx } from '../utils';
import './Table.css';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  /** Cell content. Defaults to row[key]. */
  render?: (row: T) => ReactNode;
  align?: 'start' | 'end';
  /** CSS width, e.g. "16%". */
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  /** Content of a narrow last column, e.g. a more button per row. */
  rowActions?: (row: T) => ReactNode;
  /** Row under the data, aligned right, e.g. the total cost. */
  footer?: ReactNode;
  /** Accessible name of the table. */
  caption: string;
  className?: string;
}

/**
 * Data table from the record drawer ("Resources"): a white 12px box, 24px muted header row, 32px rows
 * split by 2px Cultured lines, and an optional footer.
 */
export function Table<T>({ columns, rows, rowKey, rowActions, footer, caption, className }: TableProps<T>) {
  const span = columns.length + (rowActions ? 1 : 0);
  return (
    <div className={cx('syn-table', className)}>
      <table>
        <caption className="syn-visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" style={{ width: c.width, textAlign: c.align === 'end' ? 'right' : undefined }}>{c.header}</th>
            ))}
            {rowActions && <th scope="col" className="syn-table__actions"><span className="syn-visually-hidden">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)}>
              {columns.map((c) => (
                <td key={c.key} style={{ textAlign: c.align === 'end' ? 'right' : undefined }}>
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                </td>
              ))}
              {rowActions && <td className="syn-table__actions">{rowActions(row)}</td>}
            </tr>
          ))}
        </tbody>
        {footer && (
          <tfoot>
            <tr><td colSpan={span}>{footer}</td></tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

export interface ValueProps {
  children: ReactNode;
  /** Muted unit after the number, e.g. "Meter" or "Eur". */
  unit?: ReactNode;
  /** Mutes the number as well (secondary figures such as a unit price). */
  muted?: boolean;
  className?: string;
}

/** A number with a muted unit: "12 Meter", "240 Eur". */
export function Value({ children, unit, muted, className }: ValueProps) {
  return (
    <span className={cx('syn-value', muted && 'is-muted', className)}>
      {children}
      {unit && <span className="syn-value__unit">{unit}</span>}
    </span>
  );
}
