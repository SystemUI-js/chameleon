import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CWindow } from '../src/components/Window/Window';
import { CWindowTitle } from '../src/components/Window/WindowTitle';
import { DefaultTheme } from '../src/theme/default';
import { WinXpTheme } from '../src/theme/winxp';

describe('Window title rendering compatibility', () => {
  it('renders the default theme title through explicit composition', () => {
    render(<DefaultTheme />);

    expect(screen.getByTestId('window-title')).toHaveTextContent('Default Window');
  });

  it('renders the winxp theme title through explicit composition', () => {
    render(<WinXpTheme />);

    expect(screen.getByTestId('window-title')).toHaveTextContent('WinXP Window');
  });

  it('renders custom window titles without a registry layer', () => {
    render(
      <CWindow x={8} y={8} width={120} height={80}>
        <CWindowTitle>Custom Window</CWindowTitle>
        <div data-testid="window-body">Body</div>
      </CWindow>,
    );

    expect(screen.getByTestId('window-title')).toHaveTextContent('Custom Window');
  });
});
