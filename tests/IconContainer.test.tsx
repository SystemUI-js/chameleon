import { DragOperationType } from '@system-ui-js/multi-drag';
import '@testing-library/jest-dom';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { CIconContainer as PackageEntryCIconContainer, type CIconContainerItem } from '../src';
import { CIconContainer } from '../src/components/Icon/IconContainer';

type MockPose = {
  position?: {
    x: number;
    y: number;
  };
};

type MockDragOptions = {
  getPose?: (element: HTMLElement) => MockPose & { width: number; height: number };
  setPose?: (element: HTMLElement, pose: MockPose) => void;
  setPoseOnEnd?: (element: HTMLElement, pose: MockPose) => void;
};

type DragListener = () => void;

type RuntimeDragCallbacks = {
  onDragStart?: (position: { x: number; y: number }) => void;
  onDrag?: (position: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
};
type RuntimeIconContainerItem = CIconContainerItem & RuntimeDragCallbacks;

const dispatchTouchPointerDown = (
  element: HTMLElement,
  init: {
    pointerId: number;
    clientX: number;
    clientY: number;
  },
): void => {
  const pointerDownEvent = createEvent.pointerDown(element, {
    pointerId: init.pointerId,
    button: 0,
    clientX: init.clientX,
    clientY: init.clientY,
  });

  Object.defineProperty(pointerDownEvent, 'pointerType', {
    configurable: true,
    value: 'touch',
  });

  fireEvent(element, pointerDownEvent);
};

type MockDragInstance = {
  readonly element: HTMLElement;
  readonly options: MockDragOptions;
  readonly listeners: Map<string, Set<DragListener>>;
  disabled: boolean;
  addEventListener: (type: string, callback: DragListener) => void;
  removeEventListener: (type: string, callback?: DragListener) => void;
  setDisabled: () => void;
  emit: (type: string) => void;
  move: (position: { x: number; y: number }) => void;
  end: (position: { x: number; y: number }) => void;
};

jest.mock('@system-ui-js/multi-drag', () => {
  const mockDragInstances: MockDragInstance[] = [];

  class MockDrag {
    public readonly listeners = new Map<string, Set<DragListener>>();
    public disabled = false;

    public constructor(
      public readonly element: HTMLElement,
      public readonly options: MockDragOptions,
    ) {
      this.element.style.touchAction = 'none';
      mockDragInstances.push(this);
    }

    public addEventListener(type: string, callback: DragListener): void {
      const currentListeners = this.listeners.get(type) ?? new Set<DragListener>();
      currentListeners.add(callback);
      this.listeners.set(type, currentListeners);
    }

    public removeEventListener(type: string, callback?: DragListener): void {
      const currentListeners = this.listeners.get(type);

      if (!currentListeners) {
        return;
      }

      if (callback) {
        currentListeners.delete(callback);
      } else {
        currentListeners.clear();
      }
    }

    public setDisabled(): void {
      this.disabled = true;
    }

    public emit(type: string): void {
      if (this.disabled) {
        return;
      }

      for (const listener of this.listeners.get(type) ?? []) {
        listener();
      }
    }

    public move(position: { x: number; y: number }): void {
      if (this.disabled) {
        return;
      }

      this.options.setPose?.(this.element, { position });
    }

    public end(position: { x: number; y: number }): void {
      if (this.disabled) {
        return;
      }

      this.options.setPoseOnEnd?.(this.element, { position });
    }
  }

  return {
    __esModule: true,
    Drag: MockDrag,
    DragOperationType: {
      Start: 'start',
      Move: 'move',
      End: 'end',
      Inertial: 'inertial',
      InertialEnd: 'inertialEnd',
      AllEnd: 'allEnd',
    },
    __mock: {
      instances: mockDragInstances,
    },
  };
});

const { __mock: multiDragMock } = jest.requireMock('@system-ui-js/multi-drag') as {
  __mock: {
    instances: MockDragInstance[];
  };
};

describe('CIconContainer', () => {
  beforeEach(() => {
    multiDragMock.instances.length = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('exports CIconContainer from package entry', () => {
    render(
      <PackageEntryCIconContainer
        iconList={[{ icon: <span>icon</span> }]}
        data-testid="container-package-entry"
      />,
    );

    const container = screen.getByTestId('container-package-entry');

    expect(PackageEntryCIconContainer).toBe(CIconContainer);
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('cm-icon-container');
  });

  describe('iconList item contract', () => {
    it('renders icon items with correct testid pattern', () => {
      const iconList: readonly RuntimeIconContainerItem[] = [
        { icon: <span>Icon 1</span> },
        { icon: <span>Icon 2</span> },
        { icon: <span>Icon 3</span> },
      ];

      render(<CIconContainer iconList={iconList} data-testid="icon-container" />);

      expect(screen.getByTestId('icon-container')).toBeInTheDocument();
      expect(screen.getByTestId('icon-item-0')).toHaveClass('cm-icon');
      expect(screen.getByTestId('icon-item-1')).toHaveClass('cm-icon');
      expect(screen.getByTestId('icon-item-2')).toHaveClass('cm-icon');
      expect(screen.getByTestId('icon-item-0').tagName).toBe('BUTTON');
      expect(multiDragMock.instances).toHaveLength(3);
    });

    it('excludes drag callbacks from iconList item contract', () => {
      const baseItem = {
        title: 'Test',
        icon: <span>Icon</span>,
      };

      // @ts-expect-error - onDragStart is excluded from CIconContainerItem
      const itemWithDragStart: CIconContainerItem = { ...baseItem, onDragStart: () => {} };

      // @ts-expect-error - onDrag is excluded from CIconContainerItem
      const itemWithDrag: CIconContainerItem = { ...baseItem, onDrag: () => {} };

      // @ts-expect-error - onDragEnd is excluded from CIconContainerItem
      const itemWithDragEnd: CIconContainerItem = { ...baseItem, onDragEnd: () => {} };

      expect(itemWithDragStart).toBeDefined();
      expect(itemWithDrag).toBeDefined();
      expect(itemWithDragEnd).toBeDefined();
    });

    it('accepts icon, title, and active from item contract', () => {
      const iconList: readonly RuntimeIconContainerItem[] = [
        {
          icon: <span data-testid="test-icon">Icon</span>,
          title: 'Test Title',
          active: true,
        },
      ];

      render(<CIconContainer iconList={iconList} data-testid="icon-container" />);

      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
      expect(screen.getByTestId('icon-item-0')).toHaveClass('cm-icon--active');
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders items in array order with stable testids', () => {
      const iconList: readonly CIconContainerItem[] = [
        { icon: <span data-testid="first">First</span> },
        { icon: <span data-testid="second">Second</span> },
        { icon: <span data-testid="third">Third</span> },
      ];

      render(<CIconContainer iconList={iconList} data-testid="icon-container" />);

      const container = screen.getByTestId('icon-container');
      const items = container.querySelectorAll('[data-testid^="icon-item-"]');

      expect(items).toHaveLength(3);
      expect(items[0]).toHaveAttribute('data-testid', 'icon-item-0');
      expect(items[1]).toHaveAttribute('data-testid', 'icon-item-1');
      expect(items[2]).toHaveAttribute('data-testid', 'icon-item-2');
    });

    it('applies config defaults and respects per-item overrides', () => {
      const defaultItemOnActive = jest.fn();
      const defaultItemOnOpen = jest.fn();
      const overrideItemOnActive = jest.fn();
      const overrideItemOnOpen = jest.fn();

      const iconList: readonly RuntimeIconContainerItem[] = [
        {
          icon: <span>Default Item</span>,
          title: 'Default Item',
          onActive: defaultItemOnActive,
          onOpen: defaultItemOnOpen,
        },
        {
          icon: <span>Override Item</span>,
          title: 'Override Item',
          position: { x: 20, y: 30 },
          activeTrigger: 'hover',
          openTrigger: 'click',
          onActive: overrideItemOnActive,
          onOpen: overrideItemOnOpen,
        },
      ];

      render(
        <CIconContainer
          iconList={iconList}
          config={{
            position: { x: 1, y: 2 },
            activeTrigger: 'click',
            openTrigger: 'doubleClick',
          }}
        />,
      );

      const defaultItem = screen.getByTestId('icon-item-0');
      const overrideItem = screen.getByTestId('icon-item-1');

      expect(defaultItem).toHaveStyle({ left: '1px', top: '2px' });
      expect(overrideItem).toHaveStyle({ left: '20px', top: '30px' });

      fireEvent.click(defaultItem);
      expect(defaultItemOnActive).toHaveBeenCalledWith(true);
      expect(defaultItemOnOpen).not.toHaveBeenCalled();
      expect(defaultItem).toHaveClass('cm-icon--active');

      fireEvent.doubleClick(defaultItem);
      expect(defaultItemOnOpen).toHaveBeenCalledTimes(1);

      fireEvent.click(overrideItem);
      expect(overrideItemOnOpen).toHaveBeenCalledTimes(1);
      expect(overrideItemOnActive).not.toHaveBeenCalled();

      fireEvent.mouseEnter(overrideItem);
      expect(overrideItemOnActive).toHaveBeenCalledWith(true);
      expect(overrideItem).toHaveClass('cm-icon--active');
      expect(defaultItem).not.toHaveClass('cm-icon--active');
    });

    it('tracks active icon without mutating sibling positions', () => {
      const iconList: readonly CIconContainerItem[] = [
        {
          icon: <span>First</span>,
          title: 'First',
          position: { x: 10, y: 20 },
          activeTrigger: 'click',
        },
        {
          icon: <span>Second</span>,
          title: 'Second',
          position: { x: 100, y: 200 },
          activeTrigger: 'click',
        },
      ];

      render(<CIconContainer iconList={iconList} />);

      const firstItem = screen.getByTestId('icon-item-0');
      const secondItem = screen.getByTestId('icon-item-1');

      expect(firstItem).not.toHaveClass('cm-icon--active');
      expect(firstItem).toHaveStyle({ left: '10px', top: '20px' });
      expect(secondItem).toHaveStyle({ left: '100px', top: '200px' });

      fireEvent.click(firstItem);

      expect(firstItem).toHaveClass('cm-icon--active');
      expect(secondItem).not.toHaveClass('cm-icon--active');

      fireEvent.click(secondItem);

      expect(firstItem).not.toHaveClass('cm-icon--active');
      expect(secondItem).toHaveClass('cm-icon--active');
      expect(firstItem).toHaveStyle({ left: '10px', top: '20px' });
      expect(secondItem).toHaveStyle({ left: '100px', top: '200px' });
    });

    it('syncs active UI when parent rerenders a different active item', () => {
      const firstIcon = <span>First</span>;
      const secondIcon = <span>Second</span>;

      const { rerender } = render(
        <CIconContainer
          iconList={[
            { icon: firstIcon, title: 'First', active: true },
            { icon: secondIcon, title: 'Second' },
          ]}
        />,
      );

      const firstItem = screen.getByTestId('icon-item-0');
      const secondItem = screen.getByTestId('icon-item-1');

      expect(firstItem).toHaveClass('cm-icon--active');
      expect(secondItem).not.toHaveClass('cm-icon--active');

      rerender(
        <CIconContainer
          iconList={[
            { icon: firstIcon, title: 'First' },
            { icon: secondIcon, title: 'Second', active: true },
          ]}
        />,
      );

      expect(firstItem).not.toHaveClass('cm-icon--active');
      expect(secondItem).toHaveClass('cm-icon--active');
    });

    it('preserves dragged positions when parent rerenders with a new iconList reference', () => {
      const firstIcon = <span>First</span>;
      const secondIcon = <span>Second</span>;
      const firstOrder: string[] = [];
      const secondOrder: string[] = [];
      const initialIconList: readonly RuntimeIconContainerItem[] = [
        {
          icon: firstIcon,
          title: 'First',
          position: { x: 10, y: 20 },
          onDragStart: () => {
            firstOrder.push('start');
          },
          onDrag: () => {
            firstOrder.push('drag');
          },
          onDragEnd: () => {
            firstOrder.push('end');
          },
        },
        {
          icon: secondIcon,
          title: 'Second',
          position: { x: 100, y: 200 },
          onDragStart: () => {
            secondOrder.push('start');
          },
          onDrag: () => {
            secondOrder.push('drag');
          },
          onDragEnd: () => {
            secondOrder.push('end');
          },
        },
      ];

      const rerenderIconList: readonly RuntimeIconContainerItem[] = [
        {
          icon: firstIcon,
          title: 'First',
          position: { x: 10, y: 20 },
          onDragStart: () => {
            firstOrder.push('start');
          },
          onDrag: () => {
            firstOrder.push('drag');
          },
          onDragEnd: () => {
            firstOrder.push('end');
          },
        },
        {
          icon: secondIcon,
          title: 'Second',
          position: { x: 100, y: 200 },
          onDragStart: () => {
            secondOrder.push('start');
          },
          onDrag: () => {
            secondOrder.push('drag');
          },
          onDragEnd: () => {
            secondOrder.push('end');
          },
        },
      ];

      const { rerender } = render(<CIconContainer iconList={initialIconList} />);

      const firstItem = screen.getByTestId('icon-item-0');
      const secondItem = screen.getByTestId('icon-item-1');

      act(() => {
        multiDragMock.instances[1].emit(DragOperationType.Start);
        multiDragMock.instances[1].move({ x: 145, y: 255 });
        multiDragMock.instances[1].end({ x: 145, y: 255 });
      });

      expect(firstItem).toHaveStyle({ left: '10px', top: '20px' });
      expect(secondItem).toHaveStyle({ left: '145px', top: '255px' });
      expect(firstOrder).toEqual([]);
      expect(secondOrder).toEqual(['start', 'drag', 'end']);

      rerender(<CIconContainer iconList={rerenderIconList} />);

      expect(screen.getByTestId('icon-item-0')).toHaveStyle({ left: '10px', top: '20px' });
      expect(screen.getByTestId('icon-item-1')).toHaveStyle({ left: '145px', top: '255px' });
    });

    it('keeps controlled active selection until parent updates props', () => {
      const firstIcon = <span>First</span>;
      const secondIcon = <span>Second</span>;

      const { rerender } = render(
        <CIconContainer
          iconList={[
            {
              icon: firstIcon,
              title: 'First',
              active: true,
              activeTrigger: 'click',
            },
            {
              icon: secondIcon,
              title: 'Second',
              active: false,
              activeTrigger: 'hover',
            },
          ]}
        />,
      );

      const firstItem = screen.getByTestId('icon-item-0');
      const secondItem = screen.getByTestId('icon-item-1');

      expect(firstItem).toHaveClass('cm-icon--active');
      expect(secondItem).not.toHaveClass('cm-icon--active');

      fireEvent.click(secondItem);
      fireEvent.mouseEnter(secondItem);
      fireEvent.contextMenu(secondItem);

      expect(firstItem).toHaveClass('cm-icon--active');
      expect(secondItem).not.toHaveClass('cm-icon--active');

      rerender(
        <CIconContainer
          iconList={[
            {
              icon: firstIcon,
              title: 'First',
              active: false,
              activeTrigger: 'click',
            },
            {
              icon: secondIcon,
              title: 'Second',
              active: true,
              activeTrigger: 'hover',
            },
          ]}
        />,
      );

      expect(screen.getByTestId('icon-item-0')).not.toHaveClass('cm-icon--active');
      expect(screen.getByTestId('icon-item-1')).toHaveClass('cm-icon--active');
    });

    it('clears active UI when parent rerenders with no active item', () => {
      const firstIcon = <span>First</span>;
      const secondIcon = <span>Second</span>;

      const { rerender } = render(
        <CIconContainer
          iconList={[
            { icon: firstIcon, title: 'First', active: true },
            { icon: secondIcon, title: 'Second', active: false },
          ]}
        />,
      );

      const firstItem = screen.getByTestId('icon-item-0');
      const secondItem = screen.getByTestId('icon-item-1');

      expect(firstItem).toHaveClass('cm-icon--active');
      expect(secondItem).not.toHaveClass('cm-icon--active');

      rerender(
        <CIconContainer
          iconList={[
            { icon: firstIcon, title: 'First' },
            { icon: secondIcon, title: 'Second' },
          ]}
        />,
      );

      expect(firstItem).not.toHaveClass('cm-icon--active');
      expect(secondItem).not.toHaveClass('cm-icon--active');
    });

    it('creates per-icon drags, updates only the targeted icon position, and emits drag callbacks in order', () => {
      const firstOrder: string[] = [];
      const secondOrder: string[] = [];

      const iconList: readonly RuntimeIconContainerItem[] = [
        {
          icon: <span>First</span>,
          title: 'First',
          position: { x: 10, y: 20 },
          onDragStart: () => {
            firstOrder.push('start');
          },
          onDrag: () => {
            firstOrder.push('drag');
          },
          onDragEnd: () => {
            firstOrder.push('end');
          },
        },
        {
          icon: <span>Second</span>,
          title: 'Second',
          position: { x: 100, y: 200 },
          onDragStart: () => {
            secondOrder.push('start');
          },
          onDrag: () => {
            secondOrder.push('drag');
          },
          onDragEnd: () => {
            secondOrder.push('end');
          },
        },
      ];

      render(<CIconContainer iconList={iconList} />);

      expect(multiDragMock.instances).toHaveLength(2);
      expect(screen.getByTestId('icon-container')).not.toHaveStyle({ touchAction: 'none' });
      expect(screen.getByTestId('icon-item-0')).not.toHaveStyle({ touchAction: 'none' });
      expect(multiDragMock.instances[0].element.style.touchAction).toBe('none');
      expect(multiDragMock.instances[1].element.style.touchAction).toBe('none');

      act(() => {
        multiDragMock.instances[1].emit(DragOperationType.Start);
        multiDragMock.instances[1].move({ x: 120, y: 230 });
        multiDragMock.instances[1].end({ x: 120, y: 230 });
      });

      expect(firstOrder).toEqual([]);
      expect(secondOrder).toEqual(['start', 'drag', 'end']);
      expect(screen.getByTestId('icon-item-0')).toHaveStyle({ left: '10px', top: '20px' });
      expect(screen.getByTestId('icon-item-1')).toHaveStyle({ left: '120px', top: '230px' });
    });

    it('fires touch long press exactly once after 500ms without double-triggering context menu', () => {
      jest.useFakeTimers();
      const onContextMenu = jest.fn();

      render(
        <CIconContainer
          iconList={[
            {
              icon: <span>Touch</span>,
              title: 'Touch',
              onContextMenu,
            },
          ]}
        />,
      );

      const icon = screen.getByTestId('icon-item-0');
      const hotspot = icon.parentElement as HTMLElement;

      dispatchTouchPointerDown(hotspot, {
        pointerId: 11,
        clientX: 40,
        clientY: 50,
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(onContextMenu).toHaveBeenCalledTimes(1);
      expect(icon).toHaveClass('cm-icon--active');

      const eventArg = onContextMenu.mock.calls[0][0];
      expect(eventArg.clientX).toBe(40);
      expect(eventArg.clientY).toBe(50);
      expect(eventArg.button).toBe(2);
      expect(eventArg.nativeEvent).toBeInstanceOf(MouseEvent);

      fireEvent.contextMenu(icon, {
        clientX: 40,
        clientY: 50,
        button: 2,
      });

      expect(onContextMenu).toHaveBeenCalledTimes(1);
    });

    it('clears touch long press on pointercancel without firing context menu', () => {
      jest.useFakeTimers();
      const onContextMenu = jest.fn();

      render(
        <CIconContainer
          iconList={[
            {
              icon: <span>Touch</span>,
              title: 'Touch',
              onContextMenu,
            },
          ]}
        />,
      );

      const icon = screen.getByTestId('icon-item-0');
      const hotspot = icon.parentElement as HTMLElement;

      dispatchTouchPointerDown(hotspot, {
        pointerId: 12,
        clientX: 20,
        clientY: 20,
      });

      fireEvent.pointerCancel(hotspot, {
        pointerId: 12,
        pointerType: 'touch',
        clientX: 20,
        clientY: 20,
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(onContextMenu).not.toHaveBeenCalled();
      expect(jest.getTimerCount()).toBe(0);
    });

    it('cancels long press on movement and tears down active drag on unmount', () => {
      jest.useFakeTimers();
      const onContextMenu = jest.fn();
      const iconList: readonly RuntimeIconContainerItem[] = [
        {
          icon: <span>Touch</span>,
          title: 'Touch',
          onContextMenu,
          onDrag: () => undefined,
        },
      ];

      const { unmount } = render(<CIconContainer iconList={iconList} />);

      const icon = screen.getByTestId('icon-item-0');
      const hotspot = icon.parentElement as HTMLElement;
      const [activeDrag] = multiDragMock.instances;

      dispatchTouchPointerDown(hotspot, {
        pointerId: 17,
        clientX: 10,
        clientY: 10,
      });

      fireEvent.pointerMove(document, {
        pointerId: 17,
        pointerType: 'touch',
        clientX: 18,
        clientY: 10,
      });

      act(() => {
        jest.advanceTimersByTime(500);
        activeDrag.emit(DragOperationType.Start);
        activeDrag.move({ x: 25, y: 35 });
      });

      expect(onContextMenu).not.toHaveBeenCalled();
      expect(jest.getTimerCount()).toBe(0);

      unmount();

      expect(activeDrag.disabled).toBe(true);
      expect(() => {
        activeDrag.move({ x: 30, y: 40 });
        activeDrag.end({ x: 30, y: 40 });
        fireEvent.pointerCancel(document, {
          pointerId: 17,
          pointerType: 'touch',
          clientX: 18,
          clientY: 10,
        });
        fireEvent.pointerUp(document, {
          pointerId: 17,
          pointerType: 'touch',
          clientX: 18,
          clientY: 10,
        });
      }).not.toThrow();
    });
  });
});
