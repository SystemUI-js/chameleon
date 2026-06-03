import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import type { CInputProps } from '../src';
import { CInput as PackageEntryCInput, Theme } from '../src';
import { CInput } from '../src/components/Input/CInput';

function getInputRoot(input: HTMLElement): HTMLElement {
  const root = input.closest('.cm-input');

  if (!(root instanceof HTMLElement)) {
    throw new Error('CInput root was not found');
  }

  return root;
}

describe('CInput', () => {
  it('exports CInput from package entry and matches direct import', () => {
    render(<PackageEntryCInput data-testid="input-package-entry" />);

    const input = screen.getByTestId('input-package-entry');

    expect(PackageEntryCInput).toBe(CInput);
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('cm-input__field');
    expect(getInputRoot(input)).toHaveClass('cm-input');
  });

  it('accepts public CInputProps from the package entry', () => {
    const props: CInputProps = {
      placeholder: 'Typed through public props',
      size: 'large',
      status: 'warning',
      prefix: '$',
      suffix: 'USD',
      allowClear: true,
    };

    render(<PackageEntryCInput {...props} data-testid="input-public-props" />);

    const root = getInputRoot(screen.getByTestId('input-public-props'));

    expect(root).toHaveClass('cm-input--large');
    expect(root).toHaveClass('cm-input--warning');
    expect(root.querySelector('.cm-input__prefix')).toHaveTextContent('$');
    expect(root.querySelector('.cm-input__suffix')).toHaveTextContent('USD');
  });

  describe('rendering', () => {
    it('renders a native text input field inside the cm-input root', () => {
      render(<CInput data-testid="input-basic" />);

      const input = screen.getByTestId('input-basic');

      expect(input.tagName).toBe('INPUT');
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveClass('cm-input__field');
      expect(getInputRoot(input)).toHaveClass('cm-input', 'cm-input--middle');
    });

    it('renders with placeholder text', () => {
      render(<CInput placeholder="Enter name" data-testid="input-placeholder" />);

      expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    });

    it('renders with defaultValue in uncontrolled mode', () => {
      render(<CInput defaultValue="hello" data-testid="input-default" />);

      expect(screen.getByTestId('input-default')).toHaveValue('hello');
    });

    it('renders with value in controlled mode', () => {
      render(<CInput value="controlled" onChange={() => {}} data-testid="input-controlled" />);

      expect(screen.getByTestId('input-controlled')).toHaveValue('controlled');
    });

    it('renders explicit size and status classes', () => {
      const { rerender } = render(<CInput size="small" status="error" data-testid="input-sized" />);

      expect(getInputRoot(screen.getByTestId('input-sized'))).toHaveClass(
        'cm-input--small',
        'cm-input--error',
      );

      rerender(<CInput size="large" status="warning" data-testid="input-sized" />);

      expect(getInputRoot(screen.getByTestId('input-sized'))).toHaveClass(
        'cm-input--large',
        'cm-input--warning',
      );
    });

    it('renders prefix and suffix elements', () => {
      render(<CInput prefix="@" suffix=".com" data-testid="input-affixes" />);

      const root = getInputRoot(screen.getByTestId('input-affixes'));

      expect(root.querySelector('.cm-input__prefix')).toHaveTextContent('@');
      expect(root.querySelector('.cm-input__suffix')).toHaveTextContent('.com');
    });

    it('passes planned native input attributes to the field', () => {
      const props: CInputProps = {
        autoFocus: true,
        id: 'customer-name',
        maxLength: 12,
        name: 'customerName',
      };

      render(<CInput {...props} data-testid="input-native-attrs" />);

      const input = screen.getByTestId('input-native-attrs');

      expect(input).toHaveAttribute('id', 'customer-name');
      expect(input).toHaveAttribute('maxlength', '12');
      expect(input).toHaveAttribute('name', 'customerName');
      expect(input).toHaveFocus();
    });
  });

  describe('ARIA attributes', () => {
    it('input element has implicit textbox role', () => {
      render(<CInput data-testid="input-role" />);

      expect(screen.getByTestId('input-role').tagName.toLowerCase()).toBe('input');
      expect(screen.getByTestId('input-role')).toHaveAttribute('type', 'text');
    });

    it('sets aria-disabled when disabled', () => {
      render(<CInput disabled data-testid="input-aria-disabled" />);

      expect(screen.getByTestId('input-aria-disabled')).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not set aria-disabled when enabled', () => {
      render(<CInput data-testid="input-aria-enabled" />);

      expect(screen.getByTestId('input-aria-enabled')).not.toHaveAttribute('aria-disabled');
    });

    it('sets aria-readonly when readOnly', () => {
      render(<CInput readOnly data-testid="input-aria-readonly" />);

      expect(screen.getByTestId('input-aria-readonly')).toHaveAttribute('aria-readonly', 'true');
    });

    it('does not set aria-readonly when editable', () => {
      render(<CInput data-testid="input-aria-editable" />);

      expect(screen.getByTestId('input-aria-editable')).not.toHaveAttribute('aria-readonly');
    });
  });

  describe('disabled and readOnly states', () => {
    it('adds disabled class and attribute when disabled', () => {
      render(<CInput disabled data-testid="input-disabled" />);

      const input = screen.getByTestId('input-disabled');

      expect(input).toBeDisabled();
      expect(getInputRoot(input)).toHaveClass('cm-input--disabled');
    });

    it('adds readonly class and attribute when readOnly', () => {
      render(<CInput readOnly data-testid="input-readonly" />);

      const input = screen.getByTestId('input-readonly');

      expect(input).toHaveAttribute('readonly');
      expect(getInputRoot(input)).toHaveClass('cm-input--readonly');
    });
  });

  describe('controlled mode', () => {
    it('calls onChange callback with next value and event', () => {
      const handleChange = jest.fn<void, [string, React.ChangeEvent<HTMLInputElement>]>();

      render(<CInput value="abc" onChange={handleChange} data-testid="input-ctrl" />);

      const input = screen.getByTestId('input-ctrl');

      fireEvent.change(input, { target: { value: 'xyz' } });

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange.mock.calls[0]?.[0]).toBe('xyz');
      expect(handleChange.mock.calls[0]?.[1].target).toBe(input);
    });

    it('does not update internal value when controlled', () => {
      const { rerender } = render(
        <CInput value="abc" onChange={() => {}} data-testid="input-ctrl-no-update" />,
      );

      fireEvent.change(screen.getByTestId('input-ctrl-no-update'), {
        target: { value: 'xyz' },
      });

      rerender(<CInput value="abc" onChange={() => {}} data-testid="input-ctrl-no-update" />);

      expect(screen.getByTestId('input-ctrl-no-update')).toHaveValue('abc');
    });
  });

  describe('uncontrolled mode', () => {
    it('updates internal state on change', () => {
      render(<CInput defaultValue="start" data-testid="input-unctrl" />);

      const input = screen.getByTestId('input-unctrl');

      expect(input).toHaveValue('start');

      fireEvent.change(input, { target: { value: 'changed' } });

      expect(input).toHaveValue('changed');
    });

    it('calls onChange callback even in uncontrolled mode', () => {
      const handleChange = jest.fn<void, [string, React.ChangeEvent<HTMLInputElement>]>();

      render(<CInput defaultValue="" onChange={handleChange} data-testid="input-unctrl-cb" />);

      fireEvent.change(screen.getByTestId('input-unctrl-cb'), { target: { value: 'typed' } });

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange.mock.calls[0]?.[0]).toBe('typed');
    });

    it('clears uncontrolled value and emits callbacks when allowClear is enabled', () => {
      const handleChange = jest.fn<void, [string, React.ChangeEvent<HTMLInputElement>]>();
      const handleClear = jest.fn();

      render(
        <CInput
          allowClear
          defaultValue="clear me"
          onChange={handleChange}
          onClear={handleClear}
          data-testid="input-clearable"
        />,
      );

      const input = screen.getByTestId('input-clearable');
      const clear = screen.getByRole('button', { name: 'Clear input' });

      expect(clear).toHaveClass('cm-input__clear');
      fireEvent.click(clear);

      expect(input).toHaveValue('');
      expect(handleClear).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenLastCalledWith('', expect.objectContaining({ target: input }));
    });

    it('does not change or clear when disabled', () => {
      const handleChange = jest.fn<void, [string, React.ChangeEvent<HTMLInputElement>]>();
      const handleClear = jest.fn();

      render(
        <CInput
          allowClear
          disabled
          defaultValue="locked"
          onChange={handleChange}
          onClear={handleClear}
          data-testid="input-disabled-clear"
        />,
      );

      const input = screen.getByTestId('input-disabled-clear');
      const clear = screen.getByRole('button', { name: 'Clear input' });

      expect(clear).toBeDisabled();
      fireEvent.change(input, { target: { value: 'changed' } });
      fireEvent.click(clear);

      expect(input).toHaveValue('locked');
      expect(handleChange).not.toHaveBeenCalled();
      expect(handleClear).not.toHaveBeenCalled();
    });
  });

  describe('keyboard callbacks', () => {
    it('calls onPressEnter only for Enter keydown', () => {
      const handlePressEnter = jest.fn<void, [React.KeyboardEvent<HTMLInputElement>]>();

      render(<CInput onPressEnter={handlePressEnter} data-testid="input-enter" />);

      const input = screen.getByTestId('input-enter');

      fireEvent.keyDown(input, { key: 'a' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(handlePressEnter).toHaveBeenCalledTimes(1);
    });
  });

  describe('focus and blur callbacks', () => {
    it('calls onFocus when input receives focus', () => {
      const handleFocus = jest.fn();

      render(<CInput onFocus={handleFocus} data-testid="input-focus" />);

      fireEvent.focus(screen.getByTestId('input-focus'));

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', () => {
      const handleBlur = jest.fn();

      render(<CInput onBlur={handleBlur} data-testid="input-blur" />);

      fireEvent.blur(screen.getByTestId('input-blur'));

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('theme prop', () => {
    it('applies theme class from explicit theme prop', () => {
      render(<CInput theme="cm-theme--win98" data-testid="input-themed" />);

      const root = getInputRoot(screen.getByTestId('input-themed'));
      expect(root).toHaveClass('cm-input');
      expect(root).toHaveClass('cm-theme--win98');
    });

    it('applies theme class from Theme provider when no explicit prop', () => {
      render(
        <Theme name="win98">
          <CInput data-testid="input-provider-themed" />
        </Theme>,
      );

      const root = getInputRoot(screen.getByTestId('input-provider-themed'));
      expect(root).toHaveClass('cm-input');
      expect(root).toHaveClass('cm-theme--win98');
    });

    it('explicit theme prop overrides Theme provider', () => {
      render(
        <Theme name="win98">
          <CInput theme="cm-theme--winxp" data-testid="input-override-themed" />
        </Theme>,
      );

      const root = getInputRoot(screen.getByTestId('input-override-themed'));
      expect(root).toHaveClass('cm-input');
      expect(root).toHaveClass('cm-theme--winxp');
      expect(root).not.toHaveClass('cm-theme--win98');
    });

    it('merges className with theme following correct order: base -> theme -> className', () => {
      render(
        <CInput className="custom-class" theme="cm-theme--win98" data-testid="input-merged" />,
      );

      const root = getInputRoot(screen.getByTestId('input-merged'));
      expect(root).toHaveClass('cm-input');
      expect(root).toHaveClass('cm-theme--win98');
      expect(root).toHaveClass('custom-class');
    });
  });

  describe('className prop', () => {
    it('applies custom className alongside base class', () => {
      render(<CInput className="my-custom" data-testid="input-custom-class" />);

      const root = getInputRoot(screen.getByTestId('input-custom-class'));
      expect(root).toHaveClass('cm-input');
      expect(root).toHaveClass('my-custom');
    });

    it('handles multiple custom class names', () => {
      render(<CInput className="foo bar baz" data-testid="input-multi-class" />);

      expect(getInputRoot(screen.getByTestId('input-multi-class'))).toHaveClass(
        'cm-input',
        'foo',
        'bar',
        'baz',
      );
    });
  });

  describe('unsupported variants', () => {
    it('does not expose unsupported Input variant helpers', () => {
      expect('TextArea' in CInput).toBe(false);
      expect('Search' in CInput).toBe(false);
      expect('Password' in CInput).toBe(false);
      expect('Group' in CInput).toBe(false);
    });
  });
});
