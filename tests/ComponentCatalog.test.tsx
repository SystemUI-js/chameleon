import { render, screen, within, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComponentCatalog } from '../src/dev/ComponentCatalog';
import { DEV_THEME } from '../src/dev/themeSwitcher';

describe('ComponentCatalog', () => {
  it('renders baseline catalog with default theme', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    expect(screen.getByTestId('component-catalog')).toBeInTheDocument();
    expect(screen.getByTestId('theme-root')).toBeInTheDocument();
  });

  it('Button section exposes a Show code button', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const buttonSection = screen.getByTestId('catalog-section-button');
    const showCodeButton = within(buttonSection).getByRole('button', { name: 'Show code' });
    expect(showCodeButton).toBeInTheDocument();
    expect(showCodeButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('RadioGroup section exposes a Show code button', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const radioSection = screen.getByTestId('catalog-section-radio');
    const showCodeButton = within(radioSection).getByRole('button', { name: 'Show code' });
    expect(showCodeButton).toBeInTheDocument();
    expect(showCodeButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('Select section exposes a Show code button', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const selectSection = screen.getByTestId('catalog-section-select');
    const showCodeButton = within(selectSection).getByRole('button', { name: 'Show code' });
    expect(showCodeButton).toBeInTheDocument();
    expect(showCodeButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('expanding Button does not auto-expand RadioGroup or Select', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const buttonSection = screen.getByTestId('catalog-section-button');
    const radioSection = screen.getByTestId('catalog-section-radio');
    const selectSection = screen.getByTestId('catalog-section-select');

    const buttonShowCode = within(buttonSection).getByRole('button', { name: 'Show code' });
    const radioShowCode = within(radioSection).getByRole('button', { name: 'Show code' });
    const selectShowCode = within(selectSection).getByRole('button', { name: 'Show code' });

    expect(buttonShowCode).toHaveAttribute('aria-expanded', 'false');
    expect(radioShowCode).toHaveAttribute('aria-expanded', 'false');
    expect(selectShowCode).toHaveAttribute('aria-expanded', 'false');

    act(() => {
      buttonShowCode.click();
    });

    expect(buttonShowCode).toHaveAttribute('aria-expanded', 'true');
    expect(radioShowCode).toHaveAttribute('aria-expanded', 'false');
    expect(selectShowCode).toHaveAttribute('aria-expanded', 'false');
  });

  it('Window section exposes a Show code button', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const windowSection = screen.getByTestId('catalog-section-window');
    const showCodeButton = within(windowSection).getByRole('button', { name: 'Show code' });
    expect(showCodeButton).toBeInTheDocument();
    expect(showCodeButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('Dock section exposes a Show code button', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const dockSection = screen.getByTestId('catalog-section-dock');
    const showCodeButton = within(dockSection).getByRole('button', { name: 'Show code' });
    expect(showCodeButton).toBeInTheDocument();
    expect(showCodeButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('StartBar section exposes a Show code button', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const startBarSection = screen.getByTestId('catalog-section-start-bar');
    const showCodeButton = within(startBarSection).getByRole('button', { name: 'Show code' });
    expect(showCodeButton).toBeInTheDocument();
    expect(showCodeButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('Grid section exposes a Show code button', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const gridSection = screen.getByTestId('catalog-section-grid');
    const showCodeButton = within(gridSection).getByRole('button', { name: 'Show code' });
    expect(showCodeButton).toBeInTheDocument();
    expect(showCodeButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('expanding Window section reveals CWindow snippet', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const windowSection = screen.getByTestId('catalog-section-window');
    const showCodeButton = within(windowSection).getByRole('button', { name: 'Show code' });

    act(() => {
      showCodeButton.click();
    });

    expect(showCodeButton).toHaveAttribute('aria-expanded', 'true');
    const codeElement = within(windowSection).getByText(/CWindow/);
    expect(codeElement).toBeInTheDocument();
  });

  it('Grid section remains collapsed until explicitly clicked', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const gridSection = screen.getByTestId('catalog-section-grid');
    const showCodeButton = within(gridSection).getByRole('button', { name: 'Show code' });

    expect(showCodeButton).toHaveAttribute('aria-expanded', 'false');

    act(() => {
      showCodeButton.click();
    });

    expect(showCodeButton).toHaveAttribute('aria-expanded', 'true');
    const codeElement = within(gridSection).getByText(/CGrid/);
    expect(codeElement).toBeInTheDocument();
  });
});
