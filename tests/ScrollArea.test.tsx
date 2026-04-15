import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { CScrollArea as PackageEntryCScrollArea, type CScrollAreaProps } from '../src';
import { CScrollArea } from '../src/components/ScrollArea';

function getScrollAreaContent(testId: string): HTMLElement {
  const root = screen.getByTestId(testId);
  const content = root.querySelector<HTMLElement>('[data-scroll-area-content="true"]');

  if (!content) {
    throw new Error('scroll area content not found');
  }

  return content;
}

describe('CScrollArea', () => {
  it('exports CScrollArea from package entry', () => {
    const props: CScrollAreaProps = {
      className: 'custom-root',
      contentClassName: 'custom-content',
      theme: 'cm-theme--default',
      'data-testid': 'scroll-area-package-entry',
    };

    render(
      <PackageEntryCScrollArea {...props}>
        <div>Activity</div>
      </PackageEntryCScrollArea>,
    );

    const root = screen.getByTestId('scroll-area-package-entry');
    const content = getScrollAreaContent('scroll-area-package-entry');

    expect(PackageEntryCScrollArea).toBe(CScrollArea);
    expect(root).toHaveClass('cm-scroll-area', 'cm-theme--default', 'custom-root');
    expect(content).toHaveClass('cm-scroll-area__content', 'custom-content');
  });

  it('applies overflow styles and makes the region focusable by default', () => {
    render(
      <CScrollArea
        data-testid="scroll-area-default"
        overflowX="hidden"
        overflowY="scroll"
        aria-label="Notifications"
      >
        <div>Item</div>
      </CScrollArea>,
    );

    const root = screen.getByTestId('scroll-area-default');

    expect(root).toHaveStyle({ overflowX: 'hidden', overflowY: 'scroll' });
    expect(root).toHaveAttribute('tabindex', '0');
    expect(root).toHaveAttribute('aria-label', 'Notifications');
  });

  it('respects explicit tabIndex and forwards scroll events', () => {
    const handleScroll = jest.fn();

    render(
      <CScrollArea data-testid="scroll-area-scroll" onScroll={handleScroll} tabIndex={-1}>
        <div style={{ height: '480px' }}>Long content</div>
      </CScrollArea>,
    );

    const root = screen.getByTestId('scroll-area-scroll');

    fireEvent.scroll(root, { target: { scrollTop: 48 } });

    expect(root).toHaveAttribute('tabindex', '-1');
    expect(handleScroll).toHaveBeenCalledTimes(1);
  });

  it('removes default tab stop when both axes are hidden', () => {
    render(
      <CScrollArea data-testid="scroll-area-hidden" overflowX="hidden" overflowY="hidden">
        <div>Static content</div>
      </CScrollArea>,
    );

    expect(screen.getByTestId('scroll-area-hidden')).not.toHaveAttribute('tabindex');
  });
});
