import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { CSelect as PackageEntryCSelect, Theme } from '../src';
import { CSelect, type CSelectOption, type CSelectProps } from '../src/components/Select/Select';

const OPTIONS: readonly CSelectOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana', disabled: true },
  { label: 'Cherry', value: 'cherry' },
];

const readThemeStyles = (theme: 'win98' | 'winxp'): string =>
  readFileSync(join(process.cwd(), 'src', 'theme', theme, 'styles', 'index.scss'), 'utf8');

const openSelect = (trigger: HTMLElement): void => {
  fireEvent.click(trigger);
};

describe('CSelect', () => {
  it('exports CSelect from package entry', () => {
    render(
      <PackageEntryCSelect data-testid="select-package-entry" options={OPTIONS} value="apple" />,
    );

    const trigger = screen.getByTestId('select-package-entry');

    expect(PackageEntryCSelect).toBe(CSelect);
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass('cm-select');
    expect(trigger.tagName).toBe('BUTTON');
  });

  it('renders a CMenu-backed trigger and hidden native options with supported props', () => {
    const handleChange = jest.fn();
    const props: CSelectProps = {
      options: OPTIONS,
      name: 'fruit',
      className: 'select-shell',
      placeholder: 'Choose a fruit',
      onChange: handleChange,
      'aria-label': 'Fruit picker',
      'data-testid': 'select-under-test',
    };

    render(<CSelect {...props} />);

    const trigger = screen.getByTestId('select-under-test');
    const hiddenSelect = screen.getByTestId('select-under-test__native');
    const renderedOptions = hiddenSelect.querySelectorAll('option');

    expect(trigger).toBeInTheDocument();
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('aria-label', 'Fruit picker');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveClass('cm-select');
    expect(trigger).toHaveClass('select-shell');
    expect(trigger).toHaveTextContent('Choose a fruit');
    expect(hiddenSelect).toHaveAttribute('name', 'fruit');
    expect(hiddenSelect).toHaveClass('cm-select__native');
    expect(renderedOptions).toHaveLength(4);
    expect(renderedOptions[0]).toHaveValue('');
    expect(renderedOptions[1]).toHaveValue('apple');
    expect(renderedOptions[2]).toBeDisabled();
  });

  it('opens CMenu items and adapts selection back to onChange(nextValue)', () => {
    const handleChange = jest.fn();

    render(
      <CSelect
        options={OPTIONS}
        placeholder="Choose a fruit"
        onChange={handleChange}
        data-testid="fruit-select"
      />,
    );

    const trigger = screen.getByTestId('fruit-select');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    openSelect(trigger);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-apple')).toHaveTextContent('Apple');
    expect(screen.getByTestId('menu-item-banana')).toBeDisabled();

    fireEvent.click(screen.getByTestId('menu-item-cherry'));

    expect(handleChange).toHaveBeenCalledWith('cherry');
    expect(trigger).toHaveTextContent('Cherry');
    expect(screen.getByTestId('fruit-select__native')).toHaveValue('cherry');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('uses defaultValue to initialize uncontrolled mode and reset semantics', () => {
    const handleChange = jest.fn();

    render(
      <form data-testid="fruit-form">
        <CSelect options={OPTIONS} defaultValue="apple" onChange={handleChange} name="fruit" />
        <button type="reset">Reset</button>
      </form>,
    );

    const trigger = screen.getByRole('button', { name: 'Apple' });
    const hiddenSelect = screen.getByTestId('cm-select-native-control');

    expect(hiddenSelect).toHaveValue('apple');

    openSelect(trigger);
    fireEvent.click(screen.getByTestId('menu-item-cherry'));

    expect(handleChange).toHaveBeenCalledWith('cherry');
    expect(hiddenSelect).toHaveValue('cherry');
    expect(trigger).toHaveTextContent('Cherry');

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(hiddenSelect).toHaveValue('apple');
    expect(trigger).toHaveTextContent('Apple');
  });

  it('keeps the old value in controlled mode until parent rerenders', () => {
    const handleChange = jest.fn();

    render(
      <CSelect
        options={OPTIONS}
        value="apple"
        onChange={handleChange}
        data-testid="controlled-select"
      />,
    );

    const trigger = screen.getByTestId('controlled-select');
    const hiddenSelect = screen.getByTestId('controlled-select__native');

    expect(hiddenSelect).toHaveValue('apple');
    expect(trigger).toHaveTextContent('Apple');

    openSelect(trigger);
    fireEvent.click(screen.getByTestId('menu-item-cherry'));

    expect(handleChange).toHaveBeenCalledWith('cherry');
    expect(hiddenSelect).toHaveValue('apple');
    expect(trigger).toHaveTextContent('Apple');
  });

  it('updates trigger label and hidden value when controlled value rerenders', () => {
    const ControlledSelect = (): React.ReactElement => {
      const [selectedValue, setSelectedValue] = React.useState('apple');

      return (
        <>
          <CSelect
            options={OPTIONS}
            value={selectedValue}
            onChange={setSelectedValue}
            data-testid="rerendered-select"
          />
          <button
            type="button"
            onClick={() => {
              setSelectedValue('cherry');
            }}
          >
            Pick cherry
          </button>
        </>
      );
    };

    render(<ControlledSelect />);

    const trigger = screen.getByTestId('rerendered-select');
    const hiddenSelect = screen.getByTestId('rerendered-select__native');

    expect(trigger).toHaveTextContent('Apple');
    expect(hiddenSelect).toHaveValue('apple');

    fireEvent.click(screen.getByRole('button', { name: 'Pick cherry' }));

    expect(trigger).toHaveTextContent('Cherry');
    expect(hiddenSelect).toHaveValue('cherry');
  });

  it('passes disabled through to trigger and hidden native control without opening menu', () => {
    const handleChange = jest.fn();

    render(
      <CSelect
        options={OPTIONS}
        value="apple"
        disabled
        onChange={handleChange}
        data-testid="disabled-select"
      />,
    );

    const trigger = screen.getByTestId('disabled-select');
    const hiddenSelect = screen.getByTestId('disabled-select__native');

    expect(trigger).toBeDisabled();
    expect(hiddenSelect).toBeDisabled();

    fireEvent.click(trigger);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('shows placeholder with empty hidden value and requires a real option selection', () => {
    render(<CSelect options={OPTIONS} placeholder="Choose a fruit" required data-testid="required" />);

    const trigger = screen.getByTestId('required');
    const hiddenSelect = screen.getByTestId('required__native') as HTMLSelectElement;
    const placeholderOption = hiddenSelect.querySelector('option[value=""]');

    expect(hiddenSelect).toBeRequired();
    expect(hiddenSelect).toHaveValue('');
    expect(hiddenSelect.checkValidity()).toBe(false);
    expect(placeholderOption).toBeDisabled();
    expect((placeholderOption as HTMLOptionElement).selected).toBe(true);
    expect(trigger).toHaveTextContent('Choose a fruit');

    openSelect(trigger);
    fireEvent.click(screen.getByTestId('menu-item-apple'));

    expect(hiddenSelect).toHaveValue('apple');
    expect(hiddenSelect.checkValidity()).toBe(true);
    expect(trigger).toHaveTextContent('Apple');
  });

  it('uses hidden native control value for form submission', () => {
    const handleSubmit = jest.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      return formData.get('fruit');
    });

    render(
      <form onSubmit={handleSubmit}>
        <CSelect options={OPTIONS} defaultValue="apple" name="fruit" data-testid="form-select" />
        <button type="submit">Submit</button>
      </form>,
    );

    openSelect(screen.getByTestId('form-select'));
    fireEvent.click(screen.getByTestId('menu-item-cherry'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(handleSubmit).toHaveReturnedWith('cherry');
  });

  describe('theme prop', () => {
    it('applies theme class from explicit theme prop', () => {
      render(<CSelect options={OPTIONS} value="apple" theme="cm-theme--win98" />);

      const trigger = screen.getByRole('button', { name: 'Apple' });

      expect(trigger).toHaveClass('cm-select');
      expect(trigger).toHaveClass('cm-theme--win98');
    });

    it('applies theme class from Theme provider when no explicit prop', () => {
      render(
        <Theme name="win98">
          <CSelect data-testid="provider-themed" options={OPTIONS} value="apple" />
        </Theme>,
      );

      const trigger = screen.getByTestId('provider-themed');

      expect(trigger).toHaveClass('cm-select');
      expect(trigger).toHaveClass('cm-theme--win98');
    });

    it('explicit theme prop overrides Theme provider', () => {
      render(
        <Theme name="win98">
          <CSelect
            theme="cm-theme--winxp"
            data-testid="override-themed"
            options={OPTIONS}
            value="apple"
          />
        </Theme>,
      );

      const trigger = screen.getByTestId('override-themed');

      expect(trigger).toHaveClass('cm-select');
      expect(trigger).toHaveClass('cm-theme--winxp');
      expect(trigger).not.toHaveClass('cm-theme--win98');
    });

    it('merges className with theme following correct order: base → theme → className', () => {
      render(
        <CSelect
          options={OPTIONS}
          value="apple"
          className="custom-class"
          theme="cm-theme--win98"
        />,
      );

      const trigger = screen.getByRole('button', { name: 'Apple' });

      expect(trigger).toHaveClass('cm-select');
      expect(trigger).toHaveClass('cm-theme--win98');
      expect(trigger).toHaveClass('custom-class');
    });

    it('keeps select theme selectors self-scoped in theme styles', () => {
      expect(readThemeStyles('win98')).toContain('&.cm-select');
      expect(readThemeStyles('winxp')).toContain('&.cm-select');
    });
  });
});
