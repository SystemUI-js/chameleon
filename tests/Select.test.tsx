import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CSelect as PackageEntryCSelect } from '../src';
import { CSelect, type CSelectOption, type CSelectProps } from '../src/components/Select/Select';

const OPTIONS: readonly CSelectOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana', disabled: true },
  { label: 'Cherry', value: 'cherry' },
];

describe('CSelect', () => {
  it('exports CSelect from package entry', () => {
    render(
      <PackageEntryCSelect data-testid="select-package-entry" options={OPTIONS} value="apple" />,
    );

    const select = screen.getByTestId('select-package-entry');

    expect(PackageEntryCSelect).toBe(CSelect);
    expect(select).toBeInTheDocument();
    expect(select).toHaveClass('cm-select');
  });

  it('renders native select options and supported props', () => {
    const handleChange = jest.fn();
    const props: CSelectProps = {
      options: OPTIONS,
      name: 'fruit',
      className: 'select-shell',
      placeholder: 'Choose a fruit',
      onChange: handleChange,
      'data-testid': 'select-under-test',
    };

    render(<CSelect {...props} />);

    const select = screen.getByRole('combobox');
    const renderedOptions = screen.getAllByRole('option');
    const placeholderOption = screen.getByRole('option', { name: 'Choose a fruit' });
    const disabledOption = screen.getByRole('option', { name: 'Banana' });

    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveAttribute('data-testid', 'select-under-test');
    expect(select).toHaveAttribute('name', 'fruit');
    expect(select).toHaveClass('cm-select');
    expect(select).toHaveClass('select-shell');
    expect(renderedOptions).toHaveLength(4);
    expect(placeholderOption).toHaveValue('');
    expect(disabledOption).toBeDisabled();
  });

  it('uses defaultValue to initialize uncontrolled mode and updates after change', () => {
    const handleChange = jest.fn();

    render(<CSelect options={OPTIONS} defaultValue="apple" onChange={handleChange} />);

    const select = screen.getByRole('combobox');

    expect(select).toHaveValue('apple');

    fireEvent.change(select, { target: { value: 'cherry' } });

    expect(handleChange).toHaveBeenCalledWith('cherry');
    expect(select).toHaveValue('cherry');
  });

  it('keeps the old value in controlled mode until parent rerenders', () => {
    const handleChange = jest.fn();

    render(<CSelect options={OPTIONS} value="apple" onChange={handleChange} />);

    const select = screen.getByRole('combobox');

    expect(select).toHaveValue('apple');

    fireEvent.change(select, { target: { value: 'cherry' } });

    expect(handleChange).toHaveBeenCalledWith('cherry');
    expect(select).toHaveValue('apple');
  });

  it('passes disabled through to the native select', () => {
    render(<CSelect options={OPTIONS} value="apple" disabled />);

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('shows placeholder with empty value and requires a real option selection', () => {
    render(<CSelect options={OPTIONS} placeholder="Choose a fruit" required />);

    const select = screen.getByRole('combobox');
    const placeholderOption = screen.getByRole('option', { name: 'Choose a fruit' });

    expect(select).toBeRequired();
    expect(select).toHaveValue('');
    expect(placeholderOption).toBeDisabled();
    expect((placeholderOption as HTMLOptionElement).selected).toBe(true);

    fireEvent.change(select, { target: { value: 'apple' } });

    expect(select).toHaveValue('apple');
  });
});
