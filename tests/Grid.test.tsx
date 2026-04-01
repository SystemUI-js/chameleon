import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Theme } from '../src';
import { CGrid, CGridItem } from '../src/components/Grid/Grid';

describe('CGridItem style merge', () => {
  it('uses cm-grid and cm-grid-item base classes by default', () => {
    const { container } = render(
      <CGrid grid={[2, 2]}>
        <CGridItem parentGrid={[2, 2]} grid={[1, 2, 1, 2]}>
          grid-item
        </CGridItem>
      </CGrid>,
    );

    const [grid, gridItem] = Array.from(container.querySelectorAll('div')) as HTMLElement[];

    expect(grid).toHaveClass('cm-grid');
    expect(gridItem).toHaveClass('cm-grid-item');
  });

  it('preserves caller style while applying grid placement styles', () => {
    const { container } = render(
      <CGridItem
        parentGrid={[3, 3]}
        grid={[1, 2, 2, 4]}
        style={{ zIndex: 9, backgroundColor: 'rgb(255, 0, 0)' }}
      >
        grid-item
      </CGridItem>,
    );

    const gridItem = container.firstElementChild as HTMLElement;

    expect(gridItem).toHaveStyle({
      zIndex: '9',
      backgroundColor: 'rgb(255, 0, 0)',
      gridRowStart: '1',
      gridRowEnd: '2',
      gridColumnStart: '2',
      gridColumnEnd: '4',
    });
    expect(gridItem).toHaveClass('cm-grid-item');
  });

  it('inherits theme from provider and keeps base classes', () => {
    const { container } = render(
      <Theme name="cm-theme--retro">
        <CGrid grid={[2, 2]}>
          <CGridItem parentGrid={[2, 2]} grid={[1, 2, 1, 2]}>
            grid-item
          </CGridItem>
        </CGrid>
      </Theme>,
    );

    const grid = container.querySelector('.cm-grid');
    const gridItem = container.querySelector('.cm-grid-item');

    expect(grid).toHaveClass('cm-grid', 'cm-theme--retro');
    expect(gridItem).toHaveClass('cm-grid-item', 'cm-theme--retro');
  });

  it('prefers explicit theme over provider theme', () => {
    const { container } = render(
      <Theme name="cm-theme--retro">
        <CGrid grid={[2, 2]} theme="cm-theme--xp">
          <CGridItem parentGrid={[2, 2]} grid={[1, 2, 1, 2]} theme="cm-theme--classic">
            grid-item
          </CGridItem>
        </CGrid>
      </Theme>,
    );

    const grid = container.querySelector('.cm-grid');
    const gridItem = container.querySelector('.cm-grid-item');

    expect(grid).toHaveClass('cm-grid', 'cm-theme--xp');
    expect(grid).not.toHaveClass('cm-theme--retro');
    expect(gridItem).toHaveClass('cm-grid-item', 'cm-theme--classic');
    expect(gridItem).not.toHaveClass('cm-theme--retro');
  });

  it('does not forward internal grid props to plain DOM children', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CGrid grid={[3, 3]}>
        <div data-testid="grid-child">grid-child</div>
      </CGrid>,
    );

    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('React does not recognize the `parentGrid` prop'),
    );
    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('React does not recognize the `setGridSize` prop'),
    );

    errorSpy.mockRestore();
  });
});
