import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CWindow } from '../src/components/Window/Window';
import { CWindowTitle } from '../src/components/Window/WindowTitle';
import { SystemHost } from '../src/system/SystemHost';

describe('Window title rendering compatibility', () => {
  it('renders the default system title through SystemHost', () => {
    render(<SystemHost systemType="default" theme="default" />);

    expect(screen.getByTestId('screen-root')).toHaveAttribute('data-theme', 'default');
    expect(screen.getByTestId('window-title')).toHaveTextContent('Default Window');
  });

  it('renders the winxp system title through SystemHost', () => {
    render(<SystemHost systemType="windows" theme="winxp" />);

    expect(screen.getByTestId('screen-root')).toHaveAttribute('data-theme', 'winxp');
    expect(screen.getByTestId('window-title')).toHaveTextContent('Windows Window');
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
