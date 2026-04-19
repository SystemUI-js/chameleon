import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CStatusBar, CStatusBarItem } from '../src/legacy-web';

describe('CStatusBar', () => {
  it('renders items in a horizontal container', () => {
    const { container } = render(
      <CStatusBar data-testid="status-bar">
        <CStatusBarItem>Left</CStatusBarItem>
        <CStatusBarItem>Right</CStatusBarItem>
      </CStatusBar>,
    );

    const statusBar = screen.getByTestId('status-bar');

    expect(statusBar).toHaveClass('cm-status-bar');
    expect(statusBar).toContainElement(screen.getByText('Left'));
    expect(statusBar).toContainElement(screen.getByText('Right'));
    expect(statusBar.firstElementChild?.textContent).toBe('Left');
    expect(statusBar.lastElementChild?.textContent).toBe('Right');
    expect(container.firstElementChild).toBe(statusBar);
  });

  it('allows CStatusBarItem to render standalone', () => {
    render(<CStatusBarItem data-testid="status-bar-item">Standalone</CStatusBarItem>);

    const item = screen.getByTestId('status-bar-item');

    expect(item).toHaveClass('cm-status-bar__item');
    expect(item).toHaveTextContent('Standalone');
  });

  it('merges custom className on both root and item', () => {
    render(
      <CStatusBar data-testid="status-bar-custom" className="custom-status-bar">
        <CStatusBarItem data-testid="status-bar-item-custom" className="custom-status-bar-item">
          Custom item
        </CStatusBarItem>
      </CStatusBar>,
    );

    expect(screen.getByTestId('status-bar-custom')).toHaveClass(
      'cm-status-bar',
      'custom-status-bar',
    );
    expect(screen.getByTestId('status-bar-item-custom')).toHaveClass(
      'cm-status-bar__item',
      'custom-status-bar-item',
    );
  });
});
