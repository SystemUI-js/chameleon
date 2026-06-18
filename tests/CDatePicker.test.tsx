import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import {
  CDatePicker,
  CDatePicker as PackageEntry,
  type CDatePickerProps as PackageEntryProps,
} from '../src/components/DatePicker';
import { Theme } from '../src/components/Theme';

/** Helper: parse YYYY-MM-DD into a Date (local tz, UTC-safe for test) */
function ymd(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/** Today as YYYY-MM-DD in local timezone */
function todayStr(): string {
  const now = new Date();
  return ymd(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function getDatePickerParts(testId: string) {
  const root = screen.getByTestId(testId);
  const input = screen.getByTestId(`${testId}__input`) as HTMLInputElement;
  return { root, input };
}

/** Return the panel element or null */
function getPanel(testId: string): HTMLElement | null {
  return screen.queryByTestId(`${testId}__panel`);
}

/** Return all date cells as HTMLElement[] */
function getCells(testId: string): HTMLElement[] {
  const panel = getPanel(testId);
  if (!panel) return [];
  return Array.from(panel.querySelectorAll('.cm-date-picker__cell')) as HTMLElement[];
}

/** Find a cell by its data-testid */
function getCell(testId: string, dateStr: string): HTMLElement | null {
  return screen.queryByTestId(`${testId}__cell-${dateStr}`);
}

/** Get month-label text */
function getMonthLabel(testId: string): string {
  const panel = getPanel(testId);
  if (!panel) return '';
  const label = panel.querySelector('.cm-date-picker__month-label');
  return label?.textContent ?? '';
}

describe('CDatePicker', () => {
  /* ─── 1. Package-entry export sanity ─── */
  it('exports CDatePicker and props from component barrel', () => {
    const props: PackageEntryProps = {
      defaultValue: '2026-06-01',
      className: 'custom-dp',
      'data-testid': 'package-dp',
    };
    render(<PackageEntry {...props} />);
    const { root, input } = getDatePickerParts('package-dp');
    expect(PackageEntry).toBe(CDatePicker);
    expect(root).toHaveClass('cm-date-picker', 'custom-dp');
    expect(input).toHaveValue('2026-06-01');
  });

  /* ─── 2. ARIA combobox attributes when closed and open ─── */
  it('has ARIA combobox attributes when closed', () => {
    render(<CDatePicker value="2026-06-15" data-testid="aria-closed" />);
    const { root, input } = getDatePickerParts('aria-closed');
    expect(root).toHaveClass('cm-date-picker');
    expect(input).toHaveAttribute('role', 'combobox');
    expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('readonly');
    expect(getPanel('aria-closed')).not.toBeInTheDocument();
  });

  it('has ARIA combobox attributes when open', () => {
    render(<CDatePicker defaultOpen data-testid="aria-open" />);
    const { input } = getDatePickerParts('aria-open');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    const panel = getPanel('aria-open');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(input).toHaveAttribute('aria-controls', panel!.id);
  });

  /* ─── 3. Uncontrolled selection ─── */
  it('opens panel on input click, selects a date, closes panel', () => {
    const handleChange = jest.fn();
    const handleOpenChange = jest.fn();
    render(
      <CDatePicker
        defaultValue="2026-06-01"
        onChange={handleChange}
        onOpenChange={handleOpenChange}
        data-testid="uncontrolled-sel"
      />,
    );
    const { root, input } = getDatePickerParts('uncontrolled-sel');

    // Click input -> open
    fireEvent.click(input);
    expect(root).toHaveClass('cm-date-picker--open');
    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(getPanel('uncontrolled-sel')).toBeInTheDocument();

    // Click an enabled date cell
    const cell = getCell('uncontrolled-sel', '2026-06-15');
    expect(cell).toBeInTheDocument();
    expect(cell).not.toHaveClass('cm-date-picker__cell--disabled');
    expect(cell).toHaveClass('cm-date-picker__cell');
    fireEvent.click(cell!);

    expect(handleChange).toHaveBeenCalledWith('2026-06-15');
    expect(input).toHaveValue('2026-06-15');
    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(getPanel('uncontrolled-sel')).not.toBeInTheDocument();
  });

  /* ─── 4. Controlled value ─── */
  it('updates displayed date and selected cell when rerendered with new value', () => {
    const ControlledDP = () => {
      const [value, setValue] = React.useState<string | null>('2026-06-10');
      return (
        <CDatePicker value={value} defaultOpen onChange={setValue} data-testid="controlled-val" />
      );
    };
    render(<ControlledDP />);
    const { input } = getDatePickerParts('controlled-val');

    expect(input).toHaveValue('2026-06-10');

    // Click a different date — panel will close after selection
    fireEvent.click(getCell('controlled-val', '2026-06-15')!);
    expect(input).toHaveValue('2026-06-15');

    // Re-open the panel to verify the selected cell carries the modifier class
    fireEvent.click(input);
    const newCell = getCell('controlled-val', '2026-06-15');
    expect(newCell).toHaveClass('cm-date-picker__cell--selected');
  });

  /* ─── 5. defaultValue initializes display ─── */
  it('shows defaultValue when no value prop is given', () => {
    render(<CDatePicker defaultValue="2026-12-25" data-testid="default-val" />);
    const { input } = getDatePickerParts('default-val');
    expect(input).toHaveValue('2026-12-25');
  });

  /* ─── 6. allowClear renders clear button, click clears ─── */
  it('clears value when allowClear is true and clear button is clicked', () => {
    const handleChange = jest.fn();
    render(
      <CDatePicker
        defaultValue="2026-06-01"
        allowClear
        onChange={handleChange}
        data-testid="clearable"
      />,
    );
    const clearBtn = screen.getByTestId('clearable__clear');
    expect(clearBtn).toHaveClass('cm-date-picker__clear');
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(handleChange).toHaveBeenCalledWith(null);
    const { input } = getDatePickerParts('clearable');
    expect(input).toHaveValue('');
    expect(screen.queryByTestId('clearable__clear')).not.toBeInTheDocument();
  });

  it('does not render clear button when allowClear is false', () => {
    render(<CDatePicker defaultValue="2026-06-01" data-testid="no-clear" />);
    expect(screen.queryByTestId('no-clear__clear')).not.toBeInTheDocument();
  });

  /* ─── 7. disabled hides clear and prevents panel from opening ─── */
  it('disabled prevents panel open and hides clear', () => {
    const handleChange = jest.fn();
    const handleOpenChange = jest.fn();
    render(
      <CDatePicker
        defaultValue="2026-06-01"
        disabled
        allowClear
        onChange={handleChange}
        onOpenChange={handleOpenChange}
        data-testid="disabled-dp"
      />,
    );
    const { root, input } = getDatePickerParts('disabled-dp');
    expect(root).toHaveClass('cm-date-picker--disabled');
    expect(root).not.toHaveClass('cm-date-picker--open');
    expect(input).toBeDisabled();
    expect(screen.queryByTestId('disabled-dp__clear')).not.toBeInTheDocument();

    fireEvent.click(input);
    expect(handleOpenChange).not.toHaveBeenCalled();
    expect(handleChange).not.toHaveBeenCalled();
    expect(getPanel('disabled-dp')).not.toBeInTheDocument();
  });

  /* ─── 8. minDate / maxDate ─── */
  it('disables out-of-range cells and prevents click', () => {
    const handleChange = jest.fn();
    render(
      <CDatePicker
        defaultValue="2026-06-15"
        minDate="2026-06-10"
        maxDate="2026-06-20"
        defaultOpen
        onChange={handleChange}
        data-testid="range-dp"
      />,
    );

    // A date before minDate
    const beforeCell = getCell('range-dp', '2026-06-05');
    expect(beforeCell).toHaveClass('cm-date-picker__cell--disabled');
    fireEvent.click(beforeCell!);
    expect(handleChange).not.toHaveBeenCalled();

    // A date after maxDate
    const afterCell = getCell('range-dp', '2026-06-25');
    expect(afterCell).toHaveClass('cm-date-picker__cell--disabled');
    fireEvent.click(afterCell!);
    expect(handleChange).not.toHaveBeenCalled();

    // An in-range date should be enabled
    const inRangeCell = getCell('range-dp', '2026-06-12');
    expect(inRangeCell).not.toHaveClass('cm-date-picker__cell--disabled');
    fireEvent.click(inRangeCell!);
    expect(handleChange).toHaveBeenCalledWith('2026-06-12');
  });

  /* ─── 9. Month navigation preserves value ─── */
  it('navigates months without changing selected value', () => {
    render(<CDatePicker defaultValue="2026-06-15" defaultOpen data-testid="nav-dp" />);
    expect(getMonthLabel('nav-dp')).toMatch(/june/i); // or exact month format

    // Click next month
    const nextBtn = screen.getByTestId('nav-dp__next-month');
    expect(nextBtn).toHaveClass('cm-date-picker__nav');
    fireEvent.click(nextBtn);
    // Month label changed
    expect(getMonthLabel('nav-dp')).not.toMatch(/june/i);
    // Value preserved
    const { input } = getDatePickerParts('nav-dp');
    expect(input).toHaveValue('2026-06-15');

    // Click prev month twice
    const prevBtn = screen.getByTestId('nav-dp__prev-month');
    expect(prevBtn).toHaveClass('cm-date-picker__nav');
    fireEvent.click(prevBtn);
    fireEvent.click(prevBtn);
    expect(getMonthLabel('nav-dp')).toMatch(/may/i);
    expect(input).toHaveValue('2026-06-15');
  });

  /* ─── 10. onOpenChange called on open and close ─── */
  it('calls onOpenChange when panel opens and closes', () => {
    const handleOpenChange = jest.fn();
    render(
      <CDatePicker
        defaultValue="2026-06-01"
        onOpenChange={handleOpenChange}
        data-testid="openchange-dp"
      />,
    );
    const { input } = getDatePickerParts('openchange-dp');

    fireEvent.click(input);
    expect(handleOpenChange).toHaveBeenCalledTimes(1);
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    // Click a date cell to close
    fireEvent.click(getCell('openchange-dp', '2026-06-10')!);
    expect(handleOpenChange).toHaveBeenCalledTimes(2);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  /* ─── 11. Today cell receives --today class ─── */
  it('marks today cell with --today class', () => {
    render(<CDatePicker defaultOpen data-testid="today-dp" />);
    const today = todayStr();
    const cell = getCell('today-dp', today);
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveClass('cm-date-picker__cell--today');
  });

  /* ─── 12. Out-of-month padding cells ─── */
  it('marks out-of-month cells with --out-of-month class', () => {
    // Use a month where we can see padding from prev/next month
    render(<CDatePicker defaultValue="2026-06-15" defaultOpen data-testid="oom-dp" />);
    const cells = getCells('oom-dp');
    const oomCells = cells.filter((c) =>
      c.classList.contains('cm-date-picker__cell--out-of-month'),
    );
    expect(oomCells.length).toBeGreaterThan(0);
  });

  /* ─── 13. Theme prop ─── */
  it('renders with theme class from explicit theme prop', () => {
    render(<CDatePicker defaultValue="2026-06-01" theme="win98" data-testid="theme-dp" />);
    const { root } = getDatePickerParts('theme-dp');
    expect(root).toHaveClass('cm-date-picker');
    expect(root).toHaveClass('cm-theme--win98');
  });

  it('renders with theme class from Theme provider', () => {
    render(
      <Theme name="win98">
        <CDatePicker defaultValue="2026-06-01" data-testid="theme-provider-dp" />
      </Theme>,
    );
    const { root } = getDatePickerParts('theme-provider-dp');
    expect(root).toHaveClass('cm-theme--win98');
  });

  /* ─── 14. Clear button stops propagation (does not open panel) ─── */
  it('clear button does not open panel (stops propagation)', () => {
    render(<CDatePicker defaultValue="2026-06-01" allowClear data-testid="clear-stop-prop" />);
    const clearBtn = screen.getByTestId('clear-stop-prop__clear');
    fireEvent.click(clearBtn);
    // Panel should not appear
    expect(getPanel('clear-stop-prop')).not.toBeInTheDocument();
  });

  /* ─── 15. aria-label and placeholder props ─── */
  it('renders aria-label and placeholder on input', () => {
    render(
      <CDatePicker
        placeholder="Pick a date"
        aria-label="Date of birth"
        data-testid="aria-label-dp"
      />,
    );
    const { input } = getDatePickerParts('aria-label-dp');
    expect(input).toHaveAttribute('placeholder', 'Pick a date');
    expect(input).toHaveAttribute('aria-label', 'Date of birth');
  });

  /* ─── 16. out-of-month cells do not call onChange or close panel when clicked ─── */
  it('clicking out-of-month cell does nothing', () => {
    const handleChange = jest.fn();
    const handleOpenChange = jest.fn();
    render(
      <CDatePicker
        defaultValue="2026-06-15"
        defaultOpen
        onChange={handleChange}
        onOpenChange={handleOpenChange}
        data-testid="oom-click"
      />,
    );
    const cells = getCells('oom-click');
    const oomCell = cells.find((c) => c.classList.contains('cm-date-picker__cell--out-of-month'));
    expect(oomCell).toBeDefined();
    fireEvent.click(oomCell!);
    expect(handleChange).not.toHaveBeenCalled();
    expect(handleOpenChange).not.toHaveBeenCalled(); // panel stays open
  });

  /* ─── 17. Document outside mousedown closes panel ─── */
  it('closes panel on document body mousedown and calls onOpenChange(false)', () => {
    const handleOpenChange = jest.fn();
    render(
      <CDatePicker
        defaultValue="2026-06-15"
        defaultOpen
        onOpenChange={handleOpenChange}
        data-testid="outside-click-dp"
      />,
    );
    expect(getPanel('outside-click-dp')).toBeInTheDocument();
    handleOpenChange.mockClear();

    // Mousedown on document.body (outside the picker root)
    fireEvent.mouseDown(document.body);

    expect(getPanel('outside-click-dp')).not.toBeInTheDocument();
    expect(handleOpenChange).toHaveBeenCalledTimes(1);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  /* ─── 18. Mousedown inside input keeps panel open ─── */
  it('does not close panel when mousedown is inside the input', () => {
    const handleOpenChange = jest.fn();
    render(
      <CDatePicker
        defaultValue="2026-06-15"
        defaultOpen
        onOpenChange={handleOpenChange}
        data-testid="inside-input-dp"
      />,
    );
    const { input } = getDatePickerParts('inside-input-dp');
    handleOpenChange.mockClear();

    fireEvent.mouseDown(input);

    expect(getPanel('inside-input-dp')).toBeInTheDocument();
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  /* ─── 19. Mousedown inside panel keeps panel open ─── */
  it('does not close panel when mousedown is inside the panel', () => {
    const handleOpenChange = jest.fn();
    render(
      <CDatePicker
        defaultValue="2026-06-15"
        defaultOpen
        onOpenChange={handleOpenChange}
        data-testid="inside-panel-dp"
      />,
    );
    const panel = getPanel('inside-panel-dp');
    expect(panel).toBeInTheDocument();
    handleOpenChange.mockClear();

    fireEvent.mouseDown(panel!);

    expect(getPanel('inside-panel-dp')).toBeInTheDocument();
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  /* ─── 20. Controlled mode: outside mousedown fires onOpenChange(false) but panel stays ─── */
  it('fires onOpenChange(false) on outside mousedown in controlled mode but keeps panel until parent rerenders', () => {
    const handleOpenChange = jest.fn();
    const { rerender } = render(
      <CDatePicker
        value="2026-06-15"
        open
        onOpenChange={handleOpenChange}
        data-testid="controlled-outside-dp"
      />,
    );
    expect(getPanel('controlled-outside-dp')).toBeInTheDocument();
    handleOpenChange.mockClear();

    fireEvent.mouseDown(document.body);

    // onOpenChange should fire with false
    expect(handleOpenChange).toHaveBeenCalledTimes(1);
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    // Panel still mounted because parent hasn't rerendered with open=false
    expect(getPanel('controlled-outside-dp')).toBeInTheDocument();

    // Now simulate parent setting open=false
    rerender(
      <CDatePicker
        value="2026-06-15"
        open={false}
        onOpenChange={handleOpenChange}
        data-testid="controlled-outside-dp"
      />,
    );
    expect(getPanel('controlled-outside-dp')).not.toBeInTheDocument();
  });

  /* ─── 21. Listener is not attached when panel is closed ─── */
  it('does not call onOpenChange when panel is closed and document mousedown fires', () => {
    const handleOpenChange = jest.fn();
    render(
      <CDatePicker
        defaultValue="2026-06-15"
        onOpenChange={handleOpenChange}
        data-testid="closed-listener-dp"
      />,
    );
    expect(getPanel('closed-listener-dp')).not.toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(handleOpenChange).not.toHaveBeenCalled();
  });
});
