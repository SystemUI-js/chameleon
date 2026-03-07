import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CGridItem } from '../src/components/Screen/Grid';

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
});
