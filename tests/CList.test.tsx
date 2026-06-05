import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CList as PackageEntryCList } from '../src';
import { CList } from '../src/components/CList/CList';

type TestItem = {
  readonly id: string;
  readonly name: string;
};

const TEST_ITEMS: readonly TestItem[] = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
  { id: '3', name: 'Item 3' },
];

const createDeferred = <T,>(): {
  readonly promise: Promise<T>;
  readonly resolve: (value: T | PromiseLike<T>) => void;
  readonly reject: (reason?: unknown) => void;
} => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
};

const createDataTransfer = (): DataTransfer =>
  ({
    dropEffect: 'none',
    effectAllowed: 'uninitialized',
    setData: jest.fn(),
  }) as unknown as DataTransfer;

const mockItemRect = (top: number, height: number): jest.SpyInstance<DOMRect, []> => {
  const rect = {
    bottom: top + height,
    height,
    left: 0,
    right: 100,
    top,
    width: 100,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;

  return jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect);
};

describe('CList', () => {
  describe('package entry export', () => {
    it('exports CList from package entry matching the direct component import', () => {
      render(
        <PackageEntryCList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          data-testid="list-package-entry"
        />,
      );

      const list = screen.getByTestId('list-package-entry');

      expect(PackageEntryCList).toBe(CList);
      expect(list).toBeInTheDocument();
    });
  });

  describe('basic rendering', () => {
    it('renders all items from the items array', () => {
      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          data-testid="list-basic"
        />,
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('renders empty state when items is empty and emptyState is provided', () => {
      render(
        <CList
          items={[]}
          renderItem={(item: TestItem) => <span>{item.name}</span>}
          emptyState={<span>No items available</span>}
          data-testid="list-empty"
        />,
      );

      expect(screen.getByText('No items available')).toBeInTheDocument();
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });

    it('applies data-testid prop to the list container', () => {
      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          data-testid="my-list"
        />,
      );

      expect(screen.getByTestId('my-list')).toBeInTheDocument();
    });
  });

  describe('rendering modes', () => {
    it('uses list mode by default with stable root and item classes', () => {
      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          data-testid="list-default-mode"
        />,
      );

      const list = screen.getByTestId('list-default-mode');
      expect(list).toHaveClass('cm-list', 'cm-list--list');
      expect(list.querySelectorAll('.cm-list__item--list')).toHaveLength(3);
      expect(list.querySelectorAll('.cm-list__item-row--list')).toHaveLength(3);
      expect(list.querySelectorAll('.cm-list__item-content--list')).toHaveLength(3);
    });

    it('renders grid mode with stable root and item classes', () => {
      render(
        <CList
          type="grid"
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          data-testid="list-grid-mode"
        />,
      );

      const list = screen.getByTestId('list-grid-mode');
      expect(list).toHaveClass('cm-list', 'cm-list--grid');
      expect(list.querySelectorAll('.cm-list__item--grid')).toHaveLength(3);
      expect(list.querySelectorAll('.cm-list__item-row--grid')).toHaveLength(3);
      expect(list.querySelectorAll('.cm-list__item-content--grid')).toHaveLength(3);
    });

    it('renders icon mode with stable root and item classes', () => {
      render(
        <CList
          type="icon"
          items={TEST_ITEMS}
          renderItem={(item) => (
            <>
              <span data-testid={`icon-${item.id}`}>□</span>
              <span>{item.name}</span>
            </>
          )}
          data-testid="list-icon-mode"
        />,
      );

      const list = screen.getByTestId('list-icon-mode');
      expect(list).toHaveClass('cm-list', 'cm-list--icon', 'cm-list--icon-grid');
      expect(list.querySelectorAll('.cm-list__item--icon')).toHaveLength(3);
      expect(list.querySelectorAll('.cm-list__item-row--icon')).toHaveLength(3);
      expect(list.querySelectorAll('.cm-list__item-content--icon')).toHaveLength(3);
      expect(screen.getByTestId('icon-1')).toBeInTheDocument();
    });

    it('renders free icon arrangement with controlled absolute item positions', () => {
      render(
        <CList
          type="icon"
          iconArrangement="free"
          iconPositions={{
            1: { x: 24, y: 32 },
            2: { x: 80, y: 16 },
          }}
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          data-testid="list-icon-free"
        />,
      );

      const list = screen.getByTestId('list-icon-free');
      const items = list.querySelectorAll('.cm-list__item');

      expect(list).toHaveClass('cm-list--icon', 'cm-list--icon-free');
      expect(list).not.toHaveClass('cm-list--icon-grid');
      expect(items[0]).toHaveClass('cm-list__item--icon-free');
      expect(items[0]).toHaveStyle({ left: '24px', position: 'absolute', top: '32px' });
      expect(items[1]).toHaveStyle({ left: '80px', position: 'absolute', top: '16px' });
      expect(items[2]).toHaveStyle({ left: '0px', position: 'absolute', top: '0px' });
    });

    it('updates free icon positions from controlled iconPositions', () => {
      const { rerender } = render(
        <CList
          type="icon"
          iconArrangement="free"
          iconPositions={{ 1: { x: 12, y: 18 } }}
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          data-testid="list-icon-controlled"
        />,
      );

      const firstItem = screen.getByTestId('list-icon-controlled').querySelector('.cm-list__item');
      expect(firstItem).toHaveStyle({ left: '12px', top: '18px' });

      rerender(
        <CList
          type="icon"
          iconArrangement="free"
          iconPositions={{ 1: { x: 96, y: 48 } }}
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          data-testid="list-icon-controlled"
        />,
      );

      expect(firstItem).toHaveStyle({ left: '96px', top: '48px' });
    });

    it('ignores free icon positioning outside icon mode', () => {
      render(
        <>
          <CList
            type="list"
            iconArrangement="free"
            iconPositions={{ 1: { x: 24, y: 32 } }}
            items={TEST_ITEMS}
            renderItem={(item) => <span>{item.name}</span>}
            getItemKey={(item) => item.id}
            data-testid="list-free-ignored"
          />
          <CList
            type="grid"
            iconArrangement="free"
            iconPositions={{ 1: { x: 24, y: 32 } }}
            items={TEST_ITEMS}
            renderItem={(item) => <span>{item.name}</span>}
            getItemKey={(item) => item.id}
            data-testid="grid-free-ignored"
          />
        </>,
      );

      const listItem = screen.getByTestId('list-free-ignored').querySelector('.cm-list__item');
      const gridItem = screen.getByTestId('grid-free-ignored').querySelector('.cm-list__item');

      expect(screen.getByTestId('list-free-ignored')).not.toHaveClass('cm-list--icon-free');
      expect(screen.getByTestId('grid-free-ignored')).not.toHaveClass('cm-list--icon-free');
      expect(listItem).not.toHaveClass('cm-list__item--icon-free');
      expect(gridItem).not.toHaveClass('cm-list__item--icon-free');
      expect(listItem).not.toHaveStyle({ left: '24px', position: 'absolute', top: '32px' });
      expect(gridItem).not.toHaveStyle({ left: '24px', position: 'absolute', top: '32px' });
    });

    it('emits controlled free icon position changes from pointer drag', () => {
      const onIconPositionChange = jest.fn();

      render(
        <CList
          type="icon"
          iconArrangement="free"
          iconPositions={{ 1: { x: 20, y: 10 } }}
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          onIconPositionChange={onIconPositionChange}
          data-testid="list-icon-position-change"
        />,
      );

      const firstItem = screen
        .getByTestId('list-icon-position-change')
        .querySelector('.cm-list__item');
      const dataTransfer = createDataTransfer();

      expect(firstItem).not.toBeNull();
      fireEvent.dragStart(firstItem as Element, { clientX: 25, clientY: 30, dataTransfer });
      fireEvent.dragEnd(firstItem as Element, { clientX: 145, clientY: 90, dataTransfer });

      expect(onIconPositionChange).toHaveBeenCalledTimes(1);
      expect(onIconPositionChange).toHaveBeenCalledWith(
        expect.objectContaining({
          item: TEST_ITEMS[0],
          key: '1',
          index: 0,
          position: { x: 140, y: 70 },
          event: expect.any(Object),
        }),
      );
    });

    it('maps numeric iconSize to px CSS variable', () => {
      render(
        <CList
          type="icon"
          iconSize={48}
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          data-testid="list-numeric-icon-size"
        />,
      );

      expect(screen.getByTestId('list-numeric-icon-size')).toHaveStyle({
        '--cm-list-icon-size': '48px',
      });
    });

    it('passes string iconSize through as CSS length value', () => {
      render(
        <CList
          type="icon"
          iconSize="3rem"
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          data-testid="list-string-icon-size"
        />,
      );

      expect(screen.getByTestId('list-string-icon-size')).toHaveStyle({
        '--cm-list-icon-size': '3rem',
      });
    });

    it('renders empty state once in grid mode without item rows', () => {
      render(
        <CList
          type="grid"
          items={[]}
          renderItem={(item: TestItem) => <span>{item.name}</span>}
          emptyState={<span>No grid items</span>}
          data-testid="list-grid-empty"
        />,
      );

      const list = screen.getByTestId('list-grid-empty');
      expect(list).toHaveClass('cm-list--grid', 'cm-list--empty');
      expect(screen.getByText('No grid items')).toBeInTheDocument();
      expect(list.querySelectorAll('.cm-list__item')).toHaveLength(0);
    });
  });

  describe('custom rendering', () => {
    it('calls renderItem for each item with correct item and index', () => {
      const renderItem = jest.fn((item: TestItem, _index: number) => <span>{item.name}</span>);

      render(<CList items={TEST_ITEMS} renderItem={renderItem} getItemKey={(item) => item.id} />);

      expect(renderItem).toHaveBeenCalledTimes(3);
      expect(renderItem).toHaveBeenCalledWith(TEST_ITEMS[0], 0);
      expect(renderItem).toHaveBeenCalledWith(TEST_ITEMS[1], 1);
      expect(renderItem).toHaveBeenCalledWith(TEST_ITEMS[2], 2);
    });

    it('displays custom rendered content correctly', () => {
      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <strong data-testid={`item-${item.id}`}>{item.name}</strong>}
          getItemKey={(item) => item.id}
        />,
      );

      expect(screen.getByTestId('item-1')).toHaveTextContent('Item 1');
      expect(screen.getByTestId('item-2')).toHaveTextContent('Item 2');
      expect(screen.getByTestId('item-3')).toHaveTextContent('Item 3');
    });
  });

  describe('click interaction', () => {
    it('fires onItemClick when an item is clicked', () => {
      const onItemClick = jest.fn();

      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          onItemClick={onItemClick}
          data-testid="list-clickable"
        />,
      );

      const list = screen.getByTestId('list-clickable');
      const buttons = list.querySelectorAll('button');
      fireEvent.click(buttons[0]);

      expect(onItemClick).toHaveBeenCalledTimes(1);
      expect(onItemClick).toHaveBeenCalledWith(TEST_ITEMS[0], 0, expect.any(Object));
    });

    it('passes correct item and index for each clicked item', () => {
      const onItemClick = jest.fn();

      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          onItemClick={onItemClick}
          data-testid="list-click-verify"
        />,
      );

      const list = screen.getByTestId('list-click-verify');
      const buttons = list.querySelectorAll('button');

      fireEvent.click(buttons[1]);
      expect(onItemClick).toHaveBeenLastCalledWith(TEST_ITEMS[1], 1, expect.any(Object));

      fireEvent.click(buttons[2]);
      expect(onItemClick).toHaveBeenLastCalledWith(TEST_ITEMS[2], 2, expect.any(Object));

      expect(onItemClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('blank list events', () => {
    it('fires blank click, double-click, and context-menu handlers only from the root list', () => {
      const onBlankClick = jest.fn();
      const onBlankDoubleClick = jest.fn();
      const onBlankContextMenu = jest.fn();

      render(
        <CList
          type="icon"
          iconArrangement="free"
          items={TEST_ITEMS}
          renderItem={(item) => <span data-testid={`blank-child-${item.id}`}>{item.name}</span>}
          getItemKey={(item) => item.id}
          onBlankClick={onBlankClick}
          onBlankDoubleClick={onBlankDoubleClick}
          onBlankContextMenu={onBlankContextMenu}
          data-testid="list-blank-events"
        />,
      );

      const list = screen.getByTestId('list-blank-events');

      fireEvent.click(screen.getByTestId('blank-child-1'));
      fireEvent.doubleClick(screen.getByTestId('blank-child-1'));
      fireEvent.contextMenu(screen.getByTestId('blank-child-1'));

      expect(onBlankClick).not.toHaveBeenCalled();
      expect(onBlankDoubleClick).not.toHaveBeenCalled();
      expect(onBlankContextMenu).not.toHaveBeenCalled();

      fireEvent.click(list);
      fireEvent.doubleClick(list);
      fireEvent.contextMenu(list);

      expect(onBlankClick).toHaveBeenCalledTimes(1);
      expect(onBlankClick).toHaveBeenCalledWith({ event: expect.any(Object) });
      expect(onBlankDoubleClick).toHaveBeenCalledTimes(1);
      expect(onBlankDoubleClick).toHaveBeenCalledWith({ event: expect.any(Object) });
      expect(onBlankContextMenu).toHaveBeenCalledTimes(1);
      expect(onBlankContextMenu.mock.calls[0][0].event.isDefaultPrevented()).toBe(true);
    });
  });

  describe('styling and theming', () => {
    it('applies className prop', () => {
      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          className="custom-list-class"
          data-testid="list-classname"
        />,
      );

      expect(screen.getByTestId('list-classname')).toHaveClass('custom-list-class');
    });

    it('applies theme prop', () => {
      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          theme="cm-theme--win98"
          data-testid="list-themed"
        />,
      );

      expect(screen.getByTestId('list-themed')).toHaveClass('cm-theme--win98');
    });

    it('applies style prop', () => {
      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          style={{ backgroundColor: 'red', padding: '8px' }}
          data-testid="list-styled"
        />,
      );

      const list = screen.getByTestId('list-styled');
      expect(list).toHaveStyle({ backgroundColor: 'red', padding: '8px' });
    });

    it('preserves className, theme, style, aria props, and iconSize together', () => {
      render(
        <CList
          type="icon"
          iconSize={36}
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          className="custom-icon-list"
          theme="cm-theme--win98"
          style={{ backgroundColor: 'red', padding: '8px' }}
          aria-label="Icon file list"
          data-testid="list-compatible-props"
        />,
      );

      const list = screen.getByTestId('list-compatible-props');
      expect(list).toHaveClass('cm-list--icon', 'custom-icon-list', 'cm-theme--win98');
      expect(list).toHaveAttribute('aria-label', 'Icon file list');
      expect(list).toHaveStyle({
        backgroundColor: 'red',
        padding: '8px',
        '--cm-list-icon-size': '36px',
      });
    });

    it('applies aria-label prop', () => {
      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          aria-label="My custom list"
          data-testid="list-aria-label"
        />,
      );

      expect(screen.getByTestId('list-aria-label')).toHaveAttribute('aria-label', 'My custom list');
    });

    it('applies aria-labelledby prop', () => {
      render(
        <>
          <h1 id="list-heading">Test List</h1>
          <CList
            items={TEST_ITEMS}
            renderItem={(item) => <span>{item.name}</span>}
            aria-labelledby="list-heading"
            data-testid="list-aria-labelledby"
          />
        </>,
      );

      expect(screen.getByTestId('list-aria-labelledby')).toHaveAttribute(
        'aria-labelledby',
        'list-heading',
      );
    });
  });

  describe('item actions', () => {
    it('renders actions for each item in grid mode when renderActions is provided', () => {
      const renderActions = jest.fn((item: TestItem, _index: number) => (
        <button type="button" data-testid={`action-${item.id}`}>
          Delete
        </button>
      ));

      render(
        <CList
          type="grid"
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          renderActions={renderActions}
          data-testid="list-actions"
        />,
      );

      expect(renderActions).toHaveBeenCalledTimes(3);
      expect(renderActions).toHaveBeenCalledWith(TEST_ITEMS[0], 0);
      expect(renderActions).toHaveBeenCalledWith(TEST_ITEMS[1], 1);
      expect(renderActions).toHaveBeenCalledWith(TEST_ITEMS[2], 2);

      const list = screen.getByTestId('list-actions');
      const rows = list.querySelectorAll('.cm-list__item-row');
      expect(rows).toHaveLength(3);

      rows.forEach((row) => {
        expect(row).toHaveClass('cm-list__item-row--grid');
        expect(row.querySelector('.cm-list__item-content--grid')).toBeInTheDocument();
        expect(row.querySelector('.cm-list__item-actions--grid')).toBeInTheDocument();
      });

      expect(screen.getByTestId('action-1')).toBeInTheDocument();
      expect(screen.getByTestId('action-2')).toBeInTheDocument();
      expect(screen.getByTestId('action-3')).toBeInTheDocument();
    });

    it('does not trigger onItemClick when clicking action button', () => {
      const onItemClick = jest.fn();

      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          renderActions={(item) => (
            <button type="button" data-testid={`action-${item.id}`}>
              Delete
            </button>
          )}
          onItemClick={onItemClick}
          data-testid="list-actions-click"
        />,
      );

      fireEvent.click(screen.getByTestId('action-1'));
      expect(onItemClick).not.toHaveBeenCalled();
    });

    it('triggers onItemClick when clicking content area with renderActions present', () => {
      const onItemClick = jest.fn();

      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span data-testid={`content-${item.id}`}>{item.name}</span>}
          getItemKey={(item) => item.id}
          renderActions={(item) => (
            <button type="button" data-testid={`action-${item.id}`}>
              Delete
            </button>
          )}
          onItemClick={onItemClick}
          data-testid="list-content-click"
        />,
      );

      fireEvent.click(screen.getByTestId('content-1'));
      expect(onItemClick).toHaveBeenCalledTimes(1);
      expect(onItemClick).toHaveBeenCalledWith(TEST_ITEMS[0], 0, expect.any(Object));
    });

    it('does not render .cm-list__item-actions when renderActions returns null', () => {
      const renderActions = jest.fn(() => null);

      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          renderActions={renderActions}
          data-testid="list-actions-null"
        />,
      );

      const list = screen.getByTestId('list-actions-null');
      const actionsElements = list.querySelectorAll('.cm-list__item-actions');
      expect(actionsElements).toHaveLength(0);
    });

    it('renders a custom React component from renderActions', () => {
      const CustomButton = ({ label }: { label: string }) => (
        <button type="button" data-testid={`custom-btn-${label}`}>
          {label}
        </button>
      );

      render(
        <CList
          type="grid"
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          renderActions={(item) => <CustomButton label={item.name} />}
          data-testid="list-actions-custom-component"
        />,
      );

      expect(screen.getByTestId('custom-btn-Item 1')).toBeInTheDocument();
      expect(screen.getByTestId('custom-btn-Item 2')).toBeInTheDocument();
      expect(screen.getByTestId('custom-btn-Item 3')).toBeInTheDocument();

      const list = screen.getByTestId('list-actions-custom-component');
      expect(list.querySelectorAll('.cm-list__item-actions--grid')).toHaveLength(3);
    });

    it('renders intrinsic HTML elements from renderActions', () => {
      render(
        <CList
          type="grid"
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          renderActions={(item) => (
            <button type="button" data-testid={`html-btn-${item.id}`}>
              HTML
            </button>
          )}
          data-testid="list-actions-html"
        />,
      );

      expect(screen.getByTestId('html-btn-1')).toHaveTextContent('HTML');
      expect(screen.getByTestId('html-btn-2')).toHaveTextContent('HTML');
      expect(screen.getByTestId('html-btn-3')).toHaveTextContent('HTML');
    });

    it('does not render .cm-list__item-actions when renderActions returns undefined', () => {
      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          renderActions={() => undefined}
          data-testid="list-actions-undefined"
        />,
      );

      const list = screen.getByTestId('list-actions-undefined');
      const actionsElements = list.querySelectorAll('.cm-list__item-actions');
      expect(actionsElements).toHaveLength(0);
    });

    it('renders a React fragment with multiple children from renderActions', () => {
      render(
        <CList
          type="grid"
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          renderActions={(item) => (
            <>
              <button type="button" data-testid={`edit-${item.id}`}>
                Edit
              </button>
              <button type="button" data-testid={`delete-${item.id}`}>
                Delete
              </button>
            </>
          )}
          data-testid="list-actions-fragment"
        />,
      );

      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-2')).toBeInTheDocument();
      expect(screen.getByTestId('delete-2')).toBeInTheDocument();
      expect(screen.getByTestId('edit-3')).toBeInTheDocument();
      expect(screen.getByTestId('delete-3')).toBeInTheDocument();
    });
  });

  describe('expandable children and lazy loading', () => {
    it('renders synchronous children from getItemChildren after expansion', () => {
      const childItem = { id: '1-a', name: 'Item 1 Child' };

      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          renderActions={(item) => (
            <button type="button" data-testid={`action-${item.id}`}>
              Action
            </button>
          )}
          getItemKey={(item) => item.id}
          getItemChildren={(item) => (item.id === '1' ? [childItem] : undefined)}
          data-testid="list-sync-children"
        />,
      );

      expect(screen.queryByText('Item 1 Child')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Expand item 1' }));

      const list = screen.getByTestId('list-sync-children');
      expect(screen.getByText('Item 1 Child')).toBeInTheDocument();
      expect(screen.getByTestId('action-1-a')).toBeInTheDocument();
      expect(list.querySelector('.cm-list__children')).toBeInTheDocument();
      expect(list.querySelectorAll('.cm-list__item')).toHaveLength(4);
    });

    it('loads children on expansion and caches them after re-expansion', async () => {
      const loadedChildren = [{ id: '1-lazy', name: 'Lazy Child' }];
      const onLoadChildren = jest
        .fn<Promise<readonly TestItem[]>, [TestItem, string | number]>()
        .mockResolvedValue(loadedChildren);

      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          isItemExpandable={(item) => item.id === '1'}
          onLoadChildren={onLoadChildren}
          data-testid="list-lazy-success"
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Expand item 1' }));

      expect(screen.getByRole('status')).toHaveTextContent('Loading children…');
      expect(await screen.findByText('Lazy Child')).toBeInTheDocument();
      expect(onLoadChildren).toHaveBeenCalledTimes(1);
      expect(onLoadChildren).toHaveBeenCalledWith(TEST_ITEMS[0], '1');

      fireEvent.click(screen.getByRole('button', { name: 'Collapse item 1' }));
      expect(screen.queryByText('Lazy Child')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Expand item 1' }));
      expect(screen.getByText('Lazy Child')).toBeInTheDocument();
      expect(onLoadChildren).toHaveBeenCalledTimes(1);
    });

    it('shows item-local retry state after load rejection and retries successfully', async () => {
      const onLoadChildren = jest
        .fn<Promise<readonly TestItem[]>, [TestItem, string | number]>()
        .mockRejectedValueOnce(new Error('Network down'))
        .mockResolvedValueOnce([{ id: '1-retry', name: 'Recovered Child' }]);

      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          isItemExpandable={(item) => item.id === '1'}
          onLoadChildren={onLoadChildren}
          data-testid="list-lazy-retry"
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Expand item 1' }));

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Network down');

      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

      expect(await screen.findByText('Recovered Child')).toBeInTheDocument();
      expect(onLoadChildren).toHaveBeenCalledTimes(2);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not issue duplicate lazy requests while an item is loading', async () => {
      const deferred = createDeferred<readonly TestItem[]>();
      const onLoadChildren = jest
        .fn<Promise<readonly TestItem[]>, [TestItem, string | number]>()
        .mockReturnValue(deferred.promise);

      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          isItemExpandable={(item) => item.id === '1'}
          onLoadChildren={onLoadChildren}
          data-testid="list-lazy-duplicate"
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Expand item 1' }));
      fireEvent.click(screen.getByRole('button', { name: 'Collapse item 1' }));
      fireEvent.click(screen.getByRole('button', { name: 'Expand item 1' }));

      expect(onLoadChildren).toHaveBeenCalledTimes(1);

      await act(async () => {
        deferred.resolve([{ id: '1-done', name: 'Loaded Once' }]);
        await deferred.promise;
      });

      expect(screen.getByText('Loaded Once')).toBeInTheDocument();
    });

    it('avoids stale state updates when unmounted during a pending load', async () => {
      const deferred = createDeferred<readonly TestItem[]>();
      const onLoadChildren = jest
        .fn<Promise<readonly TestItem[]>, [TestItem, string | number]>()
        .mockReturnValue(deferred.promise);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      try {
        const { unmount } = render(
          <CList
            items={TEST_ITEMS}
            renderItem={(item) => <span>{item.name}</span>}
            getItemKey={(item) => item.id}
            isItemExpandable={(item) => item.id === '1'}
            onLoadChildren={onLoadChildren}
            data-testid="list-lazy-unmount"
          />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Expand item 1' }));
        unmount();

        await act(async () => {
          deferred.resolve([{ id: '1-after-unmount', name: 'After Unmount' }]);
          await deferred.promise;
        });

        expect(consoleErrorSpy).not.toHaveBeenCalled();
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });

    it('keeps draggable classes and handles when nested rendering is enabled', () => {
      const childItem = { id: '2-a', name: 'Nested Drag Child' };

      render(
        <CList
          draggable
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          getItemChildren={(item) => (item.id === '2' ? [childItem] : undefined)}
          data-testid="list-nested-drag"
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Expand item 2' }));

      const list = screen.getByTestId('list-nested-drag');
      expect(list.querySelectorAll('.cm-list__item--draggable')).toHaveLength(4);
      expect(screen.getAllByRole('button', { name: 'Move item 1' })[0]).toHaveClass(
        'cm-list__drag-handle',
      );
    });

    it('does not expose lazy loading for non-expandable siblings', async () => {
      const onLoadChildren = jest
        .fn<Promise<readonly TestItem[]>, [TestItem, string | number]>()
        .mockResolvedValue([]);

      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          isItemExpandable={(item) => item.id === '2'}
          onLoadChildren={onLoadChildren}
          data-testid="list-non-expandable"
        />,
      );

      expect(screen.queryByRole('button', { name: 'Expand item 1' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Expand item 2' }));

      await waitFor(() => expect(onLoadChildren).toHaveBeenCalledTimes(1));
      expect(onLoadChildren).toHaveBeenCalledWith(TEST_ITEMS[1], '2');
    });
  });

  describe('drag and reorder intent', () => {
    it('emits same-level reorder intent from pointer drag without mutating items', () => {
      const onItemDrag = jest.fn();
      const rectSpy = mockItemRect(0, 90);

      render(
        <CList
          draggable
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          onItemDrag={onItemDrag}
          data-testid="list-pointer-reorder"
        />,
      );

      const list = screen.getByTestId('list-pointer-reorder');
      const items = list.querySelectorAll('.cm-list__item');
      const dataTransfer = createDataTransfer();

      fireEvent.dragStart(items[0], { dataTransfer });
      fireEvent.dragOver(items[1], { dataTransfer, clientY: 80 });
      fireEvent.drop(items[1], { dataTransfer, clientY: 80 });

      expect(onItemDrag).toHaveBeenCalledTimes(1);
      expect(onItemDrag).toHaveBeenCalledWith({
        source: { item: TEST_ITEMS[0], key: '1', index: 0 },
        target: { item: TEST_ITEMS[1], key: '2', index: 1 },
        position: 'after',
        input: 'pointer',
      });
      expect(screen.getAllByText(/Item/).map((element) => element.textContent)).toEqual([
        'Item 1',
        'Item 2',
        'Item 3',
      ]);

      rectSpy.mockRestore();
    });

    it('emits pointer drag-into intent without also emitting reorder intent', () => {
      const onItemDrag = jest.fn();
      const onItemDragInto = jest.fn();
      const rectSpy = mockItemRect(0, 90);

      render(
        <CList
          draggable
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          onItemDrag={onItemDrag}
          onItemDragInto={onItemDragInto}
          data-testid="list-pointer-inside"
        />,
      );

      const list = screen.getByTestId('list-pointer-inside');
      const items = list.querySelectorAll('.cm-list__item');
      const dataTransfer = createDataTransfer();
      dataTransfer.dropEffect = 'copy';

      fireEvent.dragStart(items[0], { dataTransfer });
      fireEvent.dragOver(items[1], { dataTransfer });
      fireEvent.drop(items[1], { dataTransfer });

      expect(onItemDrag).not.toHaveBeenCalled();
      expect(onItemDragInto).toHaveBeenCalledTimes(1);
      expect(onItemDragInto).toHaveBeenCalledWith({
        source: { item: TEST_ITEMS[0], key: '1', index: 0 },
        target: { item: TEST_ITEMS[1], key: '2', index: 1 },
        position: 'inside',
        input: 'pointer',
      });

      rectSpy.mockRestore();
    });

    it('rejects pointer self-drop without firing movement callbacks', () => {
      const onItemDrag = jest.fn();
      const onItemDragInto = jest.fn();

      render(
        <CList
          draggable
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          onItemDrag={onItemDrag}
          onItemDragInto={onItemDragInto}
          data-testid="list-self-drop"
        />,
      );

      const item = screen.getByTestId('list-self-drop').querySelector('.cm-list__item');
      const dataTransfer = createDataTransfer();

      expect(item).not.toBeNull();
      fireEvent.dragStart(item as Element, { dataTransfer });
      fireEvent.drop(item as Element, { dataTransfer, altKey: true });

      expect(onItemDrag).not.toHaveBeenCalled();
      expect(onItemDragInto).not.toHaveBeenCalled();
    });

    it('rejects dropping a parent item into its rendered child', () => {
      const onItemDrag = jest.fn();
      const onItemDragInto = jest.fn();
      const childItem = { id: '1-a', name: 'Item 1 Child' };

      render(
        <CList
          draggable
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          getItemChildren={(item) => (item.id === '1' ? [childItem] : undefined)}
          onItemDrag={onItemDrag}
          onItemDragInto={onItemDragInto}
          data-testid="list-descendant-drop"
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Expand item 1' }));

      const items = screen.getByTestId('list-descendant-drop').querySelectorAll('.cm-list__item');
      const dataTransfer = createDataTransfer();
      dataTransfer.dropEffect = 'copy';

      fireEvent.dragStart(items[0], { dataTransfer });
      fireEvent.dragOver(items[1], { dataTransfer });
      fireEvent.drop(items[1], { dataTransfer });

      expect(onItemDrag).not.toHaveBeenCalled();
      expect(onItemDragInto).not.toHaveBeenCalled();
    });

    it('emits keyboard movement intent from a focusable drag handle', () => {
      const onItemDrag = jest.fn();

      render(
        <CList
          draggable
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          onItemDrag={onItemDrag}
          data-testid="list-keyboard-reorder"
        />,
      );

      const handle = screen.getByRole('button', { name: 'Move item 1' });

      expect(handle).toHaveClass('cm-list__drag-handle');
      fireEvent.keyDown(handle, { key: 'ArrowDown' });

      expect(onItemDrag).toHaveBeenCalledTimes(1);
      expect(onItemDrag).toHaveBeenCalledWith({
        source: { item: TEST_ITEMS[0], key: '1', index: 0 },
        target: { item: TEST_ITEMS[1], key: '2', index: 1 },
        position: 'after',
        input: 'keyboard',
      });
    });

    it('wires hover and double-click callbacks with stable item payloads', () => {
      const onItemHover = jest.fn();
      const onItemDoubleClick = jest.fn();

      render(
        <CList
          items={TEST_ITEMS}
          renderItem={(item) => <span>{item.name}</span>}
          getItemKey={(item) => item.id}
          onItemHover={onItemHover}
          onItemDoubleClick={onItemDoubleClick}
          data-testid="list-hover-double-click"
        />,
      );

      const secondItem = screen
        .getByTestId('list-hover-double-click')
        .querySelectorAll('.cm-list__item')[1];

      fireEvent.mouseEnter(secondItem);
      fireEvent.doubleClick(secondItem);

      expect(onItemHover).toHaveBeenCalledWith(
        expect.objectContaining({
          item: TEST_ITEMS[1],
          key: '2',
          index: 1,
          event: expect.any(Object),
        }),
      );
      expect(onItemDoubleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          item: TEST_ITEMS[1],
          key: '2',
          index: 1,
          event: expect.any(Object),
        }),
      );
    });

    it('preserves click and action behavior when draggable features are enabled', () => {
      const onItemClick = jest.fn();

      render(
        <CList
          draggable
          items={TEST_ITEMS}
          renderItem={(item) => <span data-testid={`content-${item.id}`}>{item.name}</span>}
          getItemKey={(item) => item.id}
          renderActions={(item) => (
            <button type="button" data-testid={`action-${item.id}`}>
              Delete
            </button>
          )}
          onItemClick={onItemClick}
          data-testid="list-draggable-clicks"
        />,
      );

      fireEvent.click(screen.getByTestId('content-1'));
      fireEvent.click(screen.getByTestId('action-1'));
      fireEvent.click(screen.getByRole('button', { name: 'Move item 1' }));

      expect(onItemClick).toHaveBeenCalledTimes(1);
      expect(onItemClick).toHaveBeenCalledWith(TEST_ITEMS[0], 0, expect.any(Object));
    });
  });
});
