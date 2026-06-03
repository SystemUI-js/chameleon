// biome-ignore-all lint/a11y/noRedundantRoles: CTable intentionally renders explicit ARIA roles required by its public contract.
import type React from 'react';
import { useMemo, useState } from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CTableRecord = object;
export type CTableRowKey<T extends CTableRecord> =
  | keyof T
  | ((record: T, index: number) => React.Key);
export type CTableSortDirection = 'ascend' | 'descend';
export type CTableSorter<T extends CTableRecord> = boolean | ((a: T, b: T) => number);

export interface CTableSortInfo<T extends CTableRecord> {
  readonly column: CTableColumn<T> | null;
  readonly columnKey: React.Key | null;
  readonly field: keyof T | null;
  readonly order: CTableSortDirection | null;
}

export interface CTableColumn<T extends CTableRecord> {
  readonly title: React.ReactNode;
  readonly dataIndex: keyof T;
  readonly key?: React.Key;
  readonly sorter?: CTableSorter<T>;
  readonly align?: 'left' | 'center' | 'right';
  readonly width?: number | string;
  readonly className?: string;
  readonly render?: (value: T[keyof T], record: T, index: number) => React.ReactNode;
}

export interface CTableSelectionCheckboxProps {
  readonly disabled?: boolean;
  readonly 'aria-label'?: string;
}

export interface CTableRowSelection<T extends CTableRecord> {
  readonly selectedRowKeys?: readonly React.Key[];
  readonly defaultSelectedRowKeys?: readonly React.Key[];
  readonly getCheckboxProps?: (record: T) => CTableSelectionCheckboxProps;
  readonly onChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
}

export interface CTablePaginationConfig {
  readonly current?: number;
  readonly pageSize?: number;
  readonly total?: number;
  readonly onChange?: (page: number, pageSize: number) => void;
}

export type CTablePagination = boolean | CTablePaginationConfig;

export interface CTableProps<T extends CTableRecord> {
  readonly dataSource: readonly T[];
  readonly columns: readonly CTableColumn<T>[];
  readonly rowKey?: CTableRowKey<T>;
  readonly pagination?: CTablePagination;
  readonly rowSelection?: CTableRowSelection<T>;
  readonly emptyText?: React.ReactNode;
  readonly loading?: boolean;
  readonly className?: string;
  readonly theme?: string;
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
  readonly 'data-testid'?: string;
  readonly onChange?: (sorter: CTableSortInfo<T>) => void;
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_EMPTY_TEXT = 'No data';

interface InternalSortState {
  readonly columnKey: React.Key;
  readonly direction: CTableSortDirection;
}

const getAriaSortValue = (
  activeDirection: CTableSortDirection | null,
  sortable: boolean,
): 'none' | 'ascending' | 'descending' | undefined => {
  if (activeDirection === null) {
    return sortable ? 'none' : undefined;
  }

  return activeDirection === 'ascend' ? 'ascending' : 'descending';
};

const getSortIndicator = (activeDirection: CTableSortDirection | null): string => {
  if (activeDirection === 'ascend') {
    return '▲';
  }

  if (activeDirection === 'descend') {
    return '▼';
  }

  return '↕';
};

const getColumnKey = <T extends CTableRecord>(column: CTableColumn<T>): React.Key => {
  return column.key ?? String(column.dataIndex);
};

const getWidthValue = (width: number | string | undefined): string | number | undefined => {
  if (width === undefined) {
    return undefined;
  }

  return typeof width === 'number' ? width : String(width);
};

const getColumnClasses = <T extends CTableRecord>(
  column: CTableColumn<T>,
  baseClasses: readonly string[],
): string => {
  return mergeClasses(
    [
      ...baseClasses,
      column.align !== undefined ? `cm-table__cell--align-${column.align}` : undefined,
    ].filter((value): value is string => value !== undefined),
    undefined,
    column.className,
  );
};

const getRowKey = <T extends CTableRecord>(
  record: T,
  index: number,
  rowKey: CTableRowKey<T> | undefined,
): React.Key => {
  if (typeof rowKey === 'function') {
    return rowKey(record, index);
  }

  if (rowKey !== undefined) {
    const keyedValue = record[rowKey];
    return typeof keyedValue === 'string' || typeof keyedValue === 'number' ? keyedValue : index;
  }

  const idValue = 'id' in record ? record.id : undefined;
  return typeof idValue === 'string' || typeof idValue === 'number' ? idValue : index;
};

const normalizePositiveInteger = (value: number | undefined, fallback: number): number => {
  if (value === undefined || !Number.isFinite(value) || value < 1) {
    return fallback;
  }

  return Math.floor(value);
};

const comparePrimitiveValues = (a: unknown, b: unknown): number => {
  if (a === b) {
    return 0;
  }

  if (a === null || a === undefined) {
    return -1;
  }

  if (b === null || b === undefined) {
    return 1;
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

const getNextSortDirection = (
  current: InternalSortState | null,
  columnKey: React.Key,
): CTableSortDirection | null => {
  if (current?.columnKey !== columnKey) {
    return 'ascend';
  }

  if (current.direction === 'ascend') {
    return 'descend';
  }

  return null;
};

const getPaginationConfig = (
  pagination: CTablePagination | undefined,
  dataSourceLength: number,
  internalCurrent: number,
): CTablePaginationConfig | null => {
  if (pagination === undefined || pagination === false) {
    return null;
  }

  if (pagination === true) {
    return {
      current: internalCurrent,
      pageSize: DEFAULT_PAGE_SIZE,
      total: dataSourceLength,
    };
  }

  const pageSize = normalizePositiveInteger(pagination.pageSize, DEFAULT_PAGE_SIZE);

  return {
    ...pagination,
    current: normalizePositiveInteger(pagination.current, internalCurrent),
    pageSize,
    total: normalizePositiveInteger(pagination.total, dataSourceLength),
  };
};

export function CTable<T extends CTableRecord>({
  dataSource,
  columns,
  rowKey,
  pagination,
  rowSelection,
  emptyText = DEFAULT_EMPTY_TEXT,
  loading = false,
  className,
  theme,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'data-testid': dataTestId,
  onChange,
}: CTableProps<T>): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const [internalCurrent, setInternalCurrent] = useState(1);
  const [sortState, setSortState] = useState<InternalSortState | null>(null);
  const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState<readonly React.Key[]>(
    rowSelection?.defaultSelectedRowKeys ?? [],
  );
  const paginationConfig = getPaginationConfig(pagination, dataSource.length, internalCurrent);
  const currentPage = paginationConfig?.current ?? 1;
  const pageSize = paginationConfig?.pageSize ?? dataSource.length;
  const totalItems = paginationConfig?.total ?? dataSource.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = paginationConfig === null ? 0 : (safeCurrentPage - 1) * pageSize;
  const selectedRowKeys = rowSelection?.selectedRowKeys ?? internalSelectedRowKeys;
  const selectedRowKeySet = useMemo(() => new Set(selectedRowKeys), [selectedRowKeys]);
  const rowSelectionEnabled = rowSelection !== undefined;
  const isEmpty = dataSource.length === 0;

  const sortedRows = useMemo(() => {
    if (sortState === null) {
      return dataSource;
    }

    const activeColumn = columns.find((column) => getColumnKey(column) === sortState.columnKey);

    if (activeColumn?.sorter === undefined || activeColumn.sorter === false) {
      return dataSource;
    }

    const compareRecords =
      typeof activeColumn.sorter === 'function'
        ? activeColumn.sorter
        : (a: T, b: T): number =>
            comparePrimitiveValues(a[activeColumn.dataIndex], b[activeColumn.dataIndex]);

    const directionMultiplier = sortState.direction === 'ascend' ? 1 : -1;

    return [...dataSource].sort((a, b) => compareRecords(a, b) * directionMultiplier);
  }, [columns, dataSource, sortState]);

  const visibleRows = useMemo(() => {
    if (paginationConfig === null) {
      return sortedRows;
    }

    return sortedRows.slice(pageStart, pageStart + pageSize);
  }, [pageSize, pageStart, paginationConfig, sortedRows]);

  const handlePageChange = (nextPage: number): void => {
    const normalizedPage = Math.min(Math.max(nextPage, 1), totalPages);

    if (
      pagination === true ||
      (typeof pagination === 'object' && pagination.current === undefined)
    ) {
      setInternalCurrent(normalizedPage);
    }

    paginationConfig?.onChange?.(normalizedPage, pageSize);
  };

  const handleSortChange = (column: CTableColumn<T>): void => {
    if (column.sorter === undefined || column.sorter === false) {
      return;
    }

    const columnKey = getColumnKey(column);
    const nextDirection = getNextSortDirection(sortState, columnKey);
    const nextSortState = nextDirection === null ? null : { columnKey, direction: nextDirection };

    setSortState(nextSortState);
    onChange?.({
      column: nextDirection === null ? null : column,
      columnKey: nextDirection === null ? null : columnKey,
      field: nextDirection === null ? null : column.dataIndex,
      order: nextDirection,
    });
  };

  const getSelectableRowKey = (record: T, index: number): React.Key => {
    return getRowKey(record, index, rowKey);
  };

  const getSelectedRows = (nextSelectedRowKeys: readonly React.Key[]): T[] => {
    const nextSelectedRowKeySet = new Set(nextSelectedRowKeys);
    return dataSource.filter((record, index) =>
      nextSelectedRowKeySet.has(getSelectableRowKey(record, index)),
    );
  };

  const commitSelectionChange = (nextSelectedRowKeys: readonly React.Key[]): void => {
    const mutableKeys = [...nextSelectedRowKeys];

    if (rowSelection?.selectedRowKeys === undefined) {
      setInternalSelectedRowKeys(mutableKeys);
    }

    rowSelection?.onChange?.(mutableKeys, getSelectedRows(mutableKeys));
  };

  const selectableVisibleRowKeys = visibleRows
    .map((record, visibleIndex) => {
      const rowIndex = pageStart + visibleIndex;
      const checkboxProps = rowSelection?.getCheckboxProps?.(record);

      return checkboxProps?.disabled === true ? null : getSelectableRowKey(record, rowIndex);
    })
    .filter((value): value is React.Key => value !== null);
  const allVisibleRowsSelected =
    selectableVisibleRowKeys.length > 0 &&
    selectableVisibleRowKeys.every((key) => selectedRowKeySet.has(key));
  const someVisibleRowsSelected = selectableVisibleRowKeys.some((key) =>
    selectedRowKeySet.has(key),
  );

  const handleSelectAllVisibleRows = (): void => {
    if (allVisibleRowsSelected) {
      commitSelectionChange(
        selectedRowKeys.filter((key) => !selectableVisibleRowKeys.includes(key)),
      );
      return;
    }

    commitSelectionChange([...new Set([...selectedRowKeys, ...selectableVisibleRowKeys])]);
  };

  const handleSelectRow = (rowKeyValue: React.Key): void => {
    if (selectedRowKeySet.has(rowKeyValue)) {
      commitSelectionChange(selectedRowKeys.filter((key) => key !== rowKeyValue));
      return;
    }

    commitSelectionChange([...selectedRowKeys, rowKeyValue]);
  };

  return (
    <div
      className={mergeClasses(
        [
          'cm-table',
          loading ? 'cm-table--loading' : undefined,
          isEmpty ? 'cm-table--empty' : undefined,
        ].filter((value): value is string => value !== undefined),
        resolvedTheme,
        className,
      )}
      data-testid={dataTestId}
      data-loading={loading ? 'true' : 'false'}
    >
      <div className="cm-table__scroll">
        <table
          role="table"
          className="cm-table__table"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
        >
          <thead className="cm-table__header">
            <tr role="row" className="cm-table__row cm-table__row--header">
              {rowSelectionEnabled ? (
                <th
                  role="columnheader"
                  scope="col"
                  className="cm-table__cell cm-table__cell--header cm-table__selection"
                >
                  <input
                    type="checkbox"
                    className="cm-table__selection-checkbox"
                    aria-label="Select all rows"
                    checked={allVisibleRowsSelected}
                    ref={(node) => {
                      if (node !== null) {
                        node.indeterminate = !allVisibleRowsSelected && someVisibleRowsSelected;
                      }
                    }}
                    disabled={selectableVisibleRowKeys.length === 0}
                    onChange={handleSelectAllVisibleRows}
                  />
                </th>
              ) : null}
              {columns.map((column) => {
                const columnKey = getColumnKey(column);
                const sortable = column.sorter !== undefined && column.sorter !== false;
                const activeDirection =
                  sortState?.columnKey === columnKey ? sortState.direction : null;

                return (
                  <th
                    key={columnKey}
                    role="columnheader"
                    scope="col"
                    aria-sort={getAriaSortValue(activeDirection, sortable)}
                    width={getWidthValue(column.width)}
                    className={getColumnClasses(
                      column,
                      [
                        'cm-table__cell',
                        'cm-table__cell--header',
                        sortable ? 'cm-table__cell--sortable' : undefined,
                        activeDirection !== null ? 'cm-table__cell--sorted' : undefined,
                        activeDirection !== null
                          ? `cm-table__cell--sorted-${activeDirection}`
                          : undefined,
                      ].filter((value): value is string => value !== undefined),
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        className="cm-table__sort-button cm-table__sorter"
                        onClick={() => handleSortChange(column)}
                      >
                        <span className="cm-table__sort-title">{column.title}</span>
                        <span className="cm-table__sort-indicator" aria-hidden="true">
                          {getSortIndicator(activeDirection)}
                        </span>
                      </button>
                    ) : (
                      column.title
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="cm-table__body">
            {visibleRows.length === 0 ? (
              <tr role="row" className="cm-table__row cm-table__row--empty">
                <td
                  className="cm-table__cell cm-table__cell--empty"
                  colSpan={columns.length + (rowSelectionEnabled ? 1 : 0)}
                >
                  {emptyText}
                </td>
              </tr>
            ) : null}
            {visibleRows.map((record, visibleIndex) => {
              const rowIndex = pageStart + visibleIndex;
              const rowKeyValue = getSelectableRowKey(record, rowIndex);
              const checkboxProps = rowSelection?.getCheckboxProps?.(record);
              const rowClassName = mergeClasses(['cm-table__row'], undefined, undefined);

              return (
                <tr
                  key={rowKeyValue}
                  role="row"
                  className={rowClassName}
                  data-row-key={String(rowKeyValue)}
                >
                  {rowSelectionEnabled ? (
                    <td className="cm-table__cell cm-table__selection">
                      <input
                        type="checkbox"
                        className="cm-table__selection-checkbox"
                        aria-label={checkboxProps?.['aria-label'] ?? `Select row ${rowIndex + 1}`}
                        checked={selectedRowKeySet.has(rowKeyValue)}
                        disabled={checkboxProps?.disabled === true}
                        onChange={() => handleSelectRow(rowKeyValue)}
                      />
                    </td>
                  ) : null}
                  {columns.map((column) => {
                    const value = record[column.dataIndex];

                    return (
                      <td
                        key={getColumnKey(column)}
                        className={getColumnClasses(column, ['cm-table__cell'])}
                      >
                        {column.render
                          ? column.render(value, record, rowIndex)
                          : String(value ?? '')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {loading ? (
        <div className="cm-table__loading" role="status" aria-live="polite">
          Loading...
        </div>
      ) : null}
      {paginationConfig === null ? null : (
        <nav className="cm-table__pagination" aria-label="Table pagination">
          <button
            type="button"
            className="cm-table__pagination-button"
            disabled={safeCurrentPage <= 1}
            onClick={() => handlePageChange(safeCurrentPage - 1)}
          >
            Previous
          </button>
          <span className="cm-table__pagination-status" aria-live="polite">
            Page {safeCurrentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="cm-table__pagination-button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => handlePageChange(safeCurrentPage + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
