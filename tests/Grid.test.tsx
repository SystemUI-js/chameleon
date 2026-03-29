import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CGrid, CGridItem } from '../src/components/Grid/Grid';

describe('CGridItem style merge', () => {
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
