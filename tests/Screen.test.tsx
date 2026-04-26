import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CScreen } from '../src/components/Screen/Screen';
import { CScreenManager } from '../src/components/Screen/ScreenManager';

describe('CScreen', () => {
  it('renders screen root with host-safe layout styles', () => {
    render(
      <CScreen className="screen-shell" screenClassName="screen-grid">
        <div data-testid="screen-child">content</div>
      </CScreen>,
    );

    const root = screen.getByTestId('screen-root');

    expect(root).toHaveClass('screen-shell');
    expect(root).toHaveStyle({
      position: 'relative',
      width: '100%',
      minHeight: '100%',
      flexGrow: 1,
    });
    expect(root.querySelector('.cm-grid')).toHaveClass('screen-grid');
    expect(screen.getByTestId('screen-child')).toBeInTheDocument();
  });
});

describe('CScreenManager', () => {
  it('renders each registered screen once and updates when children change', () => {
    class AlphaScreen extends CScreen {}
    class BetaScreen extends CScreen {}

    const { rerender } = render(
      <CScreenManager>
        <AlphaScreen className="alpha-screen">
          <div>Alpha</div>
        </AlphaScreen>
      </CScreenManager>,
    );

    expect(screen.getAllByTestId('screen-root')).toHaveLength(1);
    expect(screen.getByText('Alpha')).toBeInTheDocument();

    rerender(
      <CScreenManager>
        <AlphaScreen className="alpha-screen">
          <div>Alpha</div>
        </AlphaScreen>
        <BetaScreen className="beta-screen">
          <div>Beta</div>
        </BetaScreen>
      </CScreenManager>,
    );

    expect(screen.getAllByTestId('screen-root')).toHaveLength(2);
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
