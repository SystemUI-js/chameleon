import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import {
  CTimePicker as PackageEntryCTimePicker,
  type CTimePickerProps as PackageEntryCTimePickerProps,
  Theme,
} from '../src';
import { CTimePicker } from '../src/components/TimePicker';

function getTimePickerParts(testId: string): {
  root: HTMLElement;
  input: HTMLInputElement;
} {
  const root = screen.getByTestId(testId);
  const input = screen.getByTestId(`${testId}__input`) as HTMLInputElement;

  return {
    root,
    input,
  };
}

function getColumnText(panel: HTMLElement, columnIndex: number): readonly string[] {
  const columns = panel.querySelectorAll('.cm-time-picker__column');
  const column = columns[columnIndex];

  if (!(column instanceof HTMLElement)) {
    return [];
  }

  return Array.from(column.querySelectorAll('.cm-time-picker__option')).map(
    (option) => option.textContent ?? '',
  );
}

describe('CTimePicker', () => {
  it('exports CTimePicker and props from package entry', () => {
    const props: PackageEntryCTimePickerProps = {
      value: '08:30',
      format: 'HH:mm',
      allowClear: true,
      className: 'custom-time-picker',
      'data-testid': 'package-time-picker',
    };

    render(<PackageEntryCTimePicker {...props} />);

    const { root, input } = getTimePickerParts('package-time-picker');

    expect(PackageEntryCTimePicker).toBe(CTimePicker);
    expect(root).toHaveClass('cm-time-picker', 'custom-time-picker');
    expect(input).toHaveClass('cm-time-picker__input');
    expect(input).toHaveValue('08:30');
    expect(screen.getByRole('button', { name: 'Clear time' })).toHaveClass('cm-time-picker__clear');
  });

  it('renders an ARIA group with a readonly time input', () => {
    render(<CTimePicker value="14:05" aria-label="Start time" data-testid="time-picker" />);

    const group = screen.getByRole('group', { name: 'Start time' });
    const input = screen.getByRole('combobox', { name: 'Selected time' });

    expect(group).toHaveClass('cm-time-picker');
    expect(group).toHaveAttribute('data-testid', 'time-picker');
    expect(input).toHaveClass('cm-time-picker__input');
    expect(input).toHaveValue('14:05');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('renders HH:mm dropdown columns and emits a full value in uncontrolled mode', () => {
    const handleChange = jest.fn();

    render(<CTimePicker defaultValue="09:15" onChange={handleChange} data-testid="uncontrolled" />);

    const { root, input } = getTimePickerParts('uncontrolled');

    fireEvent.click(input);

    const panel = screen.getByTestId('uncontrolled__panel');

    expect(root).toHaveClass('cm-time-picker--open');
    expect(panel).toHaveClass('cm-time-picker__panel');
    expect(panel.querySelectorAll('.cm-time-picker__column')).toHaveLength(2);

    const minuteOption = screen.getByTestId('uncontrolled__minute-option-30');

    expect(minuteOption).toHaveClass('cm-time-picker__option');
    fireEvent.click(minuteOption);

    expect(handleChange).toHaveBeenCalledWith('09:30');
    expect(input).toHaveValue('09:30');
    expect(minuteOption).toHaveClass('cm-time-picker__option--selected');
  });

  it('renders HH:mm:ss dropdown columns and emits second-precision values', () => {
    const handleChange = jest.fn();

    render(
      <CTimePicker
        defaultValue="09:30:00"
        format="HH:mm:ss"
        defaultOpen
        onChange={handleChange}
        data-testid="with-seconds"
      />,
    );

    const { input } = getTimePickerParts('with-seconds');
    const panel = screen.getByTestId('with-seconds__panel');

    expect(panel.querySelectorAll('.cm-time-picker__column')).toHaveLength(3);

    fireEvent.click(screen.getByTestId('with-seconds__second-option-15'));

    expect(handleChange).toHaveBeenCalledWith('09:30:15');
    expect(input).toHaveValue('09:30:15');
  });

  it('uses hourStep, minuteStep, and secondStep to constrain option lists', () => {
    render(
      <CTimePicker
        format="HH:mm:ss"
        hourStep={6}
        minuteStep={20}
        secondStep={15}
        defaultOpen
        data-testid="stepped"
      />,
    );

    const panel = screen.getByTestId('stepped__panel');

    expect(getColumnText(panel, 0)).toEqual(['00', '06', '12', '18']);
    expect(getColumnText(panel, 1)).toEqual(['00', '20', '40']);
    expect(getColumnText(panel, 2)).toEqual(['00', '15', '30', '45']);
  });

  it('keeps controlled value until parent rerenders', () => {
    const handleChange = jest.fn();

    render(
      <CTimePicker value="10:20" defaultOpen onChange={handleChange} data-testid="controlled" />,
    );

    const { input } = getTimePickerParts('controlled');

    fireEvent.click(screen.getByTestId('controlled__hour-option-22'));

    expect(handleChange).toHaveBeenCalledWith('22:20');
    expect(input).toHaveValue('10:20');
  });

  it('updates input when controlled parent rerenders', () => {
    const ControlledTimePicker = (): React.ReactElement => {
      const [value, setValue] = React.useState<string | null>('06:10');

      return <CTimePicker value={value} defaultOpen onChange={setValue} data-testid="rerendered" />;
    };

    render(<ControlledTimePicker />);

    const { input } = getTimePickerParts('rerendered');

    fireEvent.click(screen.getByTestId('rerendered__minute-option-55'));

    expect(input).toHaveValue('06:55');
  });

  it('supports controlled and uncontrolled dropdown open state', () => {
    const handleOpenChange = jest.fn();

    const { rerender } = render(
      <CTimePicker open={false} onOpenChange={handleOpenChange} data-testid="controlled-open" />,
    );

    const { input } = getTimePickerParts('controlled-open');

    fireEvent.click(input);

    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByTestId('controlled-open__panel')).not.toBeInTheDocument();

    rerender(<CTimePicker open data-testid="controlled-open" />);
    expect(screen.getByTestId('controlled-open')).toHaveClass('cm-time-picker--open');
    expect(screen.getByTestId('controlled-open__panel')).toBeInTheDocument();

    render(<CTimePicker defaultOpen data-testid="default-open" />);
    expect(screen.getByTestId('default-open')).toHaveClass('cm-time-picker--open');
  });

  it('clears nullable values when allowClear is enabled', () => {
    const handleChange = jest.fn();

    render(
      <CTimePicker
        defaultValue="12:00"
        allowClear
        onChange={handleChange}
        data-testid="clearable"
      />,
    );

    const { input } = getTimePickerParts('clearable');

    fireEvent.click(screen.getByRole('button', { name: 'Clear time' }));

    expect(handleChange).toHaveBeenCalledWith(null);
    expect(input).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Clear time' })).not.toBeInTheDocument();
  });

  it('passes disabled to input and suppresses callback emissions', () => {
    const handleChange = jest.fn();
    const handleOpenChange = jest.fn();

    render(
      <CTimePicker
        value="12:00"
        disabled
        allowClear
        open
        onChange={handleChange}
        onOpenChange={handleOpenChange}
        data-testid="disabled"
      />,
    );

    const { root, input } = getTimePickerParts('disabled');

    expect(root).toHaveClass('cm-time-picker--disabled');
    expect(root).not.toHaveClass('cm-time-picker--open');
    expect(input).toBeDisabled();

    fireEvent.click(input);

    expect(handleOpenChange).not.toHaveBeenCalled();
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId('disabled__panel')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear time' })).not.toBeInTheDocument();
  });

  it('falls back to an empty display when defaultValue is invalid', () => {
    render(<CTimePicker defaultValue="25:99" placeholder="Pick time" data-testid="fallback" />);

    const { input } = getTimePickerParts('fallback');

    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', 'Pick time');
  });

  it('marks selected options in the dropdown panel', () => {
    render(<CTimePicker value="08:40" open data-testid="selected-option" />);

    expect(screen.getByTestId('selected-option__hour-option-08')).toHaveClass(
      'cm-time-picker__option--selected',
    );
    expect(screen.getByTestId('selected-option__minute-option-40')).toHaveClass(
      'cm-time-picker__option--selected',
    );
    expect(
      within(screen.getByTestId('selected-option__panel')).getByRole('option', { name: 'hour 08' }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  describe('theme prop', () => {
    it('applies theme class from explicit theme prop', () => {
      render(<CTimePicker value="08:00" theme="cm-theme--win98" data-testid="explicit-theme" />);

      const { root } = getTimePickerParts('explicit-theme');

      expect(root).toHaveClass('cm-time-picker');
      expect(root).toHaveClass('cm-theme--win98');
    });

    it('applies theme class from Theme provider when no explicit prop', () => {
      render(
        <Theme name="win98">
          <CTimePicker value="08:00" data-testid="provider-theme" />
        </Theme>,
      );

      const { root } = getTimePickerParts('provider-theme');

      expect(root).toHaveClass('cm-time-picker');
      expect(root).toHaveClass('cm-theme--win98');
    });

    it('explicit theme prop overrides Theme provider', () => {
      render(
        <Theme name="win98">
          <CTimePicker theme="cm-theme--winxp" value="08:00" data-testid="override-theme" />
        </Theme>,
      );

      const { root } = getTimePickerParts('override-theme');

      expect(root).toHaveClass('cm-time-picker');
      expect(root).toHaveClass('cm-theme--winxp');
      expect(root).not.toHaveClass('cm-theme--win98');
    });

    it('merges className with theme following correct order: base -> theme -> className', () => {
      render(
        <CTimePicker
          value="08:00"
          className="custom-class"
          theme="cm-theme--win98"
          data-testid="ordered-classes"
        />,
      );

      const { root } = getTimePickerParts('ordered-classes');

      expect(root.className).toBe(
        'cm-time-picker cm-time-picker--enabled cm-theme--win98 custom-class',
      );
    });
  });
});
