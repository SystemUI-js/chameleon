import { render, screen, within, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComponentCatalog } from '../src/dev/ComponentCatalog';
import { DEV_THEME } from '../src/dev/themeSwitcher';

describe('ComponentCatalog', () => {
  it('renders baseline catalog with default theme', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    expect(screen.getByTestId('component-catalog')).toBeInTheDocument();
    expect(screen.getAllByTestId('theme-root')).toHaveLength(1);
    expect(screen.getByTestId('theme-root')).toBeInTheDocument();
  });

  it('renders Theme section before Button section', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const themeSection = screen.getByTestId('catalog-section-theme');
    const buttonSection = screen.getByTestId('catalog-section-button');

    expect(
      themeSection.compareDocumentPosition(buttonSection) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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

  it('Theme section exposes a Show code button', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const themeSection = screen.getByTestId('catalog-section-theme');
    const showCodeButton = within(themeSection).getByRole('button', { name: 'Show code' });
    expect(showCodeButton).toBeInTheDocument();
    expect(showCodeButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('expanding Theme section reveals Theme-related snippet text', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const themeSection = screen.getByTestId('catalog-section-theme');
    const showCodeButton = within(themeSection).getByRole('button', { name: 'Show code' });

    act(() => {
      showCodeButton.click();
    });

    expect(showCodeButton).toHaveAttribute('aria-expanded', 'true');
    const codeElement = within(themeSection).getByText(/Theme name=/);
    expect(codeElement).toBeInTheDocument();
  });

  it('expanding Theme section does not auto-expand Button or Window sections', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const themeSection = screen.getByTestId('catalog-section-theme');
    const buttonSection = screen.getByTestId('catalog-section-button');
    const windowSection = screen.getByTestId('catalog-section-window');

    const themeShowCode = within(themeSection).getByRole('button', { name: 'Show code' });
    const buttonShowCode = within(buttonSection).getByRole('button', { name: 'Show code' });
    const windowShowCode = within(windowSection).getByRole('button', { name: 'Show code' });

    expect(themeShowCode).toHaveAttribute('aria-expanded', 'false');
    expect(buttonShowCode).toHaveAttribute('aria-expanded', 'false');
    expect(windowShowCode).toHaveAttribute('aria-expanded', 'false');

    act(() => {
      themeShowCode.click();
    });

    expect(themeShowCode).toHaveAttribute('aria-expanded', 'true');
    expect(buttonShowCode).toHaveAttribute('aria-expanded', 'false');
    expect(windowShowCode).toHaveAttribute('aria-expanded', 'false');

    const themeCodeRegion = themeSection.querySelector(
      '#catalog-section-theme-code-region',
    ) as HTMLElement;
    const buttonCodeRegion = buttonSection.querySelector(
      '#catalog-section-button-code-region',
    ) as HTMLElement;
    const windowCodeRegion = windowSection.querySelector(
      '#catalog-section-window-code-region',
    ) as HTMLElement;
    expect(themeCodeRegion).toBeInTheDocument();
    expect(buttonCodeRegion).toBeInTheDocument();
    expect(windowCodeRegion).toBeInTheDocument();
    expect(themeCodeRegion.hidden).toBe(false);
    expect(buttonCodeRegion.hidden).toBe(true);
    expect(windowCodeRegion.hidden).toBe(true);
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

  describe('Theme showcase isolation boundary', () => {
    it('theme-root exists', () => {
      render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);
      expect(screen.getAllByTestId('theme-root')).toHaveLength(1);
      expect(screen.getByTestId('theme-root')).toBeInTheDocument();
    });

    it('catalog-section-theme is NOT inside theme-root (isolation boundary)', () => {
      render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

      const themeRoot = screen.getByTestId('theme-root');
      const themeSection = screen.getByTestId('catalog-section-theme');

      expect(themeRoot).toBeInTheDocument();
      expect(themeSection).toBeInTheDocument();
      expect(themeRoot).not.toContainElement(themeSection);
    });

    it('catalog-section-button IS still inside theme-root (reference baseline)', () => {
      render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

      const themeRoot = screen.getByTestId('theme-root');
      const buttonSection = screen.getByTestId('catalog-section-button');

      expect(themeRoot).toBeInTheDocument();
      expect(buttonSection).toBeInTheDocument();
      expect(themeRoot).toContainElement(buttonSection);
    });
  });

  describe('Icon showcase section', () => {
    it('renders icon showcase section with stable test ids and coordinate status', () => {
      render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

      const iconSection = screen.getByTestId('catalog-section-icon');
      expect(iconSection).toBeInTheDocument();

      const iconContainer = within(iconSection).getByTestId('icon-container');
      expect(iconContainer).toBeInTheDocument();

      const iconItem0 = within(iconSection).getByTestId('icon-item-0');
      const iconItem1 = within(iconSection).getByTestId('icon-item-1');
      expect(iconItem0).toBeInTheDocument();
      expect(iconItem1).toBeInTheDocument();

      const coordsDisplay = within(iconSection).getByTestId('icon-coords-display');
      expect(coordsDisplay).toBeInTheDocument();

      const refreshButton = within(iconSection).getByTestId('icon-coords-refresh');
      expect(refreshButton).toBeInTheDocument();

      const activeLabel = within(iconSection).getByText('Active:');
      const openLabel = within(iconSection).getByText('Open:');
      const contextLabel = within(iconSection).getByText('Context:');
      expect(activeLabel).toBeInTheDocument();
      expect(openLabel).toBeInTheDocument();
      expect(contextLabel).toBeInTheDocument();
    });
  });
});
