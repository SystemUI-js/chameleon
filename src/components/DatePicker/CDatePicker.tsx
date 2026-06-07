import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CDatePickerProps {
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onChange?: (value: string | null) => void;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly minDate?: string;
  readonly maxDate?: string;
  readonly allowClear?: boolean;
  readonly disabled?: boolean;
  readonly theme?: string;
  readonly className?: string;
  readonly placeholder?: string;
  readonly 'aria-label'?: string;
  readonly 'data-testid'?: string;
}

/* ── Date helpers (inline, no dependencies) ── */

/** Regex for YYYY-MM-DD */
const DATE_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;

/** Validate a YYYY-MM-DD string by parsing and round-tripping */
function isValidDate(str: string | null | undefined): str is string {
  if (str === null || str === undefined) return false;
  if (!DATE_PATTERN.test(str)) return false;
  const [y, m, d] = str.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/** Compare two YYYY-MM-DD strings lexicographically */
function dateCompare(a: string | null | undefined, b: string | null | undefined): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/** True if `target` is >= `min` and <= `max` */
function isInRange(
  target: string,
  min: string | null | undefined,
  max: string | null | undefined,
): boolean {
  return (
    (min == null || dateCompare(target, min) >= 0) && (max == null || dateCompare(target, max) <= 0)
  );
}

/** Today in local timezone as YYYY-MM-DD */
function todayLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse YYYY-MM-DD to { year, month, day } */
function parseDate(str: string): { year: number; month: number; day: number } {
  const parts = str.split('-');
  return {
    year: Number(parts[0]),
    month: Number(parts[1]),
    day: Number(parts[2]),
  };
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Number of days in a given month (1-indexed) */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Day of week of the first day of month (0=Sun, 1=Mon, ..., 6=Sat) */
function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Compute previous (year, month) given current view */
function prevMonthYM(year: number, month: number): { year: number; month: number } {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

/** Compute next (year, month) given current view */
function nextMonthYM(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

type GridCell = { readonly dateStr: string; readonly inMonth: boolean };

/**
 * Build a 6×7=42 cell month grid: leading days from previous month,
 * current-month days, trailing days from next month — Sunday first.
 */
function buildMonthGrid(viewYear: number, viewMonth: number): readonly GridCell[] {
  const numDays = daysInMonth(viewYear, viewMonth);
  const startDayOfWeek = firstDayOfMonth(viewYear, viewMonth);
  const prev = prevMonthYM(viewYear, viewMonth);
  const prevMonthDays = daysInMonth(prev.year, prev.month);

  const cells: GridCell[] = [];
  /* Leading days from previous month */
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    cells.push({
      dateStr: toDateString(prev.year, prev.month, prevMonthDays - i),
      inMonth: false,
    });
  }
  /* Current month days */
  for (let day = 1; day <= numDays; day++) {
    cells.push({ dateStr: toDateString(viewYear, viewMonth, day), inMonth: true });
  }
  /* Trailing days from next month — pad until we reach 42 cells (6 rows × 7 cols) */
  const next = nextMonthYM(viewYear, viewMonth);
  let trailingDay = 1;
  while (cells.length < 42) {
    cells.push({
      dateStr: toDateString(next.year, next.month, trailingDay),
      inMonth: false,
    });
    trailingDay++;
  }
  return cells;
}

/** Is the cell clickable for this state? */
function isCellDisabled(
  inMonth: boolean,
  dateStr: string,
  disabled: boolean,
  minDate: string | undefined,
  maxDate: string | undefined,
): boolean {
  if (disabled) return true;
  if (!inMonth) return true;
  return !isInRange(dateStr, minDate, maxDate);
}

interface DateCellProps {
  readonly cell: GridCell;
  readonly todayStr: string;
  readonly selectedValue: string | null;
  readonly disabled: boolean;
  readonly minDate?: string;
  readonly maxDate?: string;
  readonly dataTestId?: string;
  readonly onSelect: (dateStr: string) => void;
}

function DateCell({
  cell,
  todayStr,
  selectedValue,
  disabled,
  minDate,
  maxDate,
  dataTestId,
  onSelect,
}: DateCellProps): React.ReactElement {
  const { dateStr, inMonth } = cell;
  const cellDisabled = isCellDisabled(inMonth, dateStr, disabled, minDate, maxDate);
  const isToday = dateStr === todayStr;
  const isSelected = dateStr === selectedValue;
  return (
    <button
      type="button"
      className={mergeClasses([
        'cm-date-picker__cell',
        ...(isToday ? ['cm-date-picker__cell--today'] : []),
        ...(isSelected ? ['cm-date-picker__cell--selected'] : []),
        ...(!inMonth ? ['cm-date-picker__cell--out-of-month'] : []),
        ...(cellDisabled ? ['cm-date-picker__cell--disabled'] : []),
      ])}
      disabled={cellDisabled}
      onClick={() => onSelect(dateStr)}
      data-testid={dataTestId ? `${dataTestId}__cell-${dateStr}` : undefined}
    >
      {dateStr.split('-')[2]}
    </button>
  );
}

interface DatePickerPanelProps {
  readonly panelId: string;
  readonly viewYear: number;
  readonly viewMonth: number;
  readonly cells: readonly GridCell[];
  readonly todayStr: string;
  readonly selectedValue: string | null;
  readonly disabled: boolean;
  readonly minDate?: string;
  readonly maxDate?: string;
  readonly dataTestId?: string;
  readonly onPrevMonth: () => void;
  readonly onNextMonth: () => void;
  readonly onSelect: (dateStr: string) => void;
}

function DatePickerPanel({
  panelId,
  viewYear,
  viewMonth,
  cells,
  todayStr,
  selectedValue,
  disabled,
  minDate,
  maxDate,
  dataTestId,
  onPrevMonth,
  onNextMonth,
  onSelect,
}: DatePickerPanelProps): React.ReactElement {
  return (
    <div
      className="cm-date-picker__panel"
      id={panelId}
      role="dialog"
      aria-label="Date picker"
      data-testid={dataTestId ? `${dataTestId}__panel` : undefined}
    >
      <div className="cm-date-picker__header">
        <button
          type="button"
          className="cm-date-picker__nav"
          onClick={onPrevMonth}
          data-testid={dataTestId ? `${dataTestId}__prev-month` : undefined}
        >
          ◀
        </button>
        <span className="cm-date-picker__month-label">
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </span>
        <button
          type="button"
          className="cm-date-picker__nav"
          onClick={onNextMonth}
          data-testid={dataTestId ? `${dataTestId}__next-month` : undefined}
        >
          ▶
        </button>
      </div>
      <div className="cm-date-picker__weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      <div className="cm-date-picker__grid">
        {cells.map((cell) => (
          <DateCell
            key={cell.dateStr}
            cell={cell}
            todayStr={todayStr}
            selectedValue={selectedValue}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            dataTestId={dataTestId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

export function CDatePicker({
  value,
  defaultValue,
  onChange,
  open,
  defaultOpen = false,
  onOpenChange,
  minDate,
  maxDate,
  allowClear = false,
  disabled = false,
  theme,
  className,
  placeholder,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: CDatePickerProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const isControlled = value !== undefined;
  const isOpenControlled = open !== undefined;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const initialDefaultValue = React.useRef(isValidDate(defaultValue) ? defaultValue : null);
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | null>(
    initialDefaultValue.current,
  );
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

  const panelId = React.useId();

  const selectedValue = isControlled ? value : uncontrolledValue;
  const resolvedValue = isValidDate(selectedValue) ? selectedValue : null;
  const isOpen = !disabled && (isOpenControlled ? open : uncontrolledOpen);

  /* ── View state (which month/year is displayed) ── */
  /* Use lazy initializers so we only parse once. */
  const [viewYear, setViewYear] = React.useState<number>(() => {
    const fromValue = resolvedValue ?? todayLocal();
    return parseDate(fromValue).year;
  });
  const [viewMonth, setViewMonth] = React.useState<number>(() => {
    const fromValue = resolvedValue ?? todayLocal();
    return parseDate(fromValue).month;
  });

  /* Sync view when value changes from outside (controlled) */
  React.useEffect(() => {
    if (resolvedValue) {
      const p = parseDate(resolvedValue);
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [resolvedValue]);

  /* ── State helpers ── */
  const setOpenState = React.useCallback(
    (nextOpen: boolean): void => {
      if (disabled) return;
      if (!isOpenControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [disabled, isOpenControlled, onOpenChange],
  );

  React.useEffect(() => {
    if (!isOpen) return;

    const handleDocumentMouseDown = (event: MouseEvent): void => {
      if (!(event.target instanceof Node)) return;
      if (rootRef.current !== null && !rootRef.current.contains(event.target)) {
        setOpenState(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [isOpen, setOpenState]);

  const emitChange = React.useCallback(
    (nextValue: string): void => {
      if (disabled) return;
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [disabled, isControlled, onChange],
  );

  /* ── Handlers ── */
  const handleInputClick = (): void => {
    setOpenState(true);
  };

  const handleClear = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (disabled) return;
    if (!isControlled) {
      setUncontrolledValue(null);
    }
    onChange?.(null);
  };

  const handlePrevMonth = (): void => {
    const prev = prevMonthYM(viewYear, viewMonth);
    setViewYear(prev.year);
    setViewMonth(prev.month);
  };

  const handleNextMonth = (): void => {
    const next = nextMonthYM(viewYear, viewMonth);
    setViewYear(next.year);
    setViewMonth(next.month);
  };

  const handleCellClick = (dateStr: string): void => {
    if (disabled) return;
    if (!isValidDate(dateStr)) return;
    if (!isInRange(dateStr, minDate, maxDate)) return;
    emitChange(dateStr);
    setOpenState(false);
  };

  /* ── Compute grid ── */
  const todayStr = React.useMemo(todayLocal, []);
  const cells = React.useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  return (
    <div
      ref={rootRef}
      className={mergeClasses(
        [
          'cm-date-picker',
          disabled ? 'cm-date-picker--disabled' : 'cm-date-picker--enabled',
          ...(isOpen ? ['cm-date-picker--open'] : []),
        ],
        resolvedTheme,
        className,
      )}
      data-testid={dataTestId}
    >
      <input
        className="cm-date-picker__input"
        value={resolvedValue ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        readOnly
        role="combobox"
        onClick={handleInputClick}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        data-testid={dataTestId ? `${dataTestId}__input` : undefined}
      />
      {allowClear && resolvedValue !== null && !disabled ? (
        <button
          type="button"
          className="cm-date-picker__clear"
          onClick={handleClear}
          data-testid={dataTestId ? `${dataTestId}__clear` : undefined}
        >
          x
        </button>
      ) : null}
      {isOpen ? (
        <DatePickerPanel
          panelId={panelId}
          viewYear={viewYear}
          viewMonth={viewMonth}
          cells={cells}
          todayStr={todayStr}
          selectedValue={resolvedValue}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          dataTestId={dataTestId}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelect={handleCellClick}
        />
      ) : null}
    </div>
  );
}
