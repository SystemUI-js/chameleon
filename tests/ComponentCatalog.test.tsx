import '@testing-library/jest-dom';
import { act, render, screen, within } from '@testing-library/react';
import { ComponentCatalog } from '../src/dev/ComponentCatalog';
import { DEV_THEME } from '../src/dev/themeSwitcher';

describe('ComponentCatalog', () => {
  it('renders baseline catalog with default theme', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    expect(screen.getByTestId('component-catalog')).toBeInTheDocument();
    expect(screen.getByTestId('theme-root')).toBeInTheDocument();
  });

  it('keeps section code disclosure working', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const themeSection = screen.getByTestId('catalog-section-theme');
    const showCodeButton = within(themeSection).getByRole('button', { name: 'Show code' });

    act(() => {
      showCodeButton.click();
    });

    expect(showCodeButton).toHaveAttribute('aria-expanded', 'true');
    expect(within(themeSection).getByText(/Theme name=/)).toBeInTheDocument();
  });

  it('renders icon, slider and split-area showcases with stable test ids', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    expect(screen.getByTestId('icon-container')).toBeInTheDocument();
    expect(screen.getByTestId('slider-demo')).toBeInTheDocument();
    expect(screen.getByTestId('split-area-demo-root')).toBeInTheDocument();
  });

  it('updates slider preset text after clicking max button', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const sliderSection = screen.getByTestId('catalog-section-slider');
    act(() => {
      within(sliderSection).getByTestId('slider-demo-max').click();
    });

    expect(within(sliderSection).getByTestId('slider-demo-value')).toHaveTextContent('Volume: 100');
  });

  it('updates split area demo status after toggle', () => {
    render(<ComponentCatalog theme={DEV_THEME.default} onThemeChange={() => {}} />);

    const splitAreaSection = screen.getByTestId('catalog-section-split-area');
    const toggleButton = within(splitAreaSection).getByTestId('split-area-demo-toggle');
    const status = within(splitAreaSection).getByTestId('split-area-demo-status');

    expect(status).toHaveTextContent('当前为三栏布局');

    act(() => {
      toggleButton.click();
    });

    expect(status).toHaveTextContent('当前为双栏布局');
  });
});
