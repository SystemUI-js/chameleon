import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import {
  createReactNativeMultiDrag,
  useReactNativeMultiDrag,
} from '../src/react-native-multi-drag';
import type { ReactNativeMultiDragStartInput } from '../src/react-native-multi-drag';

describe('react-native-multi-drag', () => {
  it('tracks session lifecycle and end reasons without DOM-only contracts', () => {
    const drag = createReactNativeMultiDrag<{ order: number }>({
      initialTargets: [
        {
          targetId: 'item-1',
          handleId: 'grip',
          layout: { x: 10, y: 20, width: 120, height: 48 },
          metadata: { order: 1 },
        },
        {
          targetId: 'item-2',
          layout: { x: 160, y: 20, width: 120, height: 48 },
          metadata: { order: 2 },
        },
      ],
    });
    const startInput: ReactNativeMultiDragStartInput<{ order: number }> = {
      pointerId: 7,
      point: { x: 16, y: 24 },
      timestamp: 1,
      targetId: 'item-1',
      handleId: 'grip',
      pointerType: 'touch',
      isPrimary: true,
    };

    drag.adapter.beginGesture(startInput);

    expect(drag.getState().activeTargetId).toBe('item-1');
    expect(drag.getState().activeHandleId).toBe('grip');
    expect(drag.getState().targets.find((target) => target.targetId === 'item-1')?.active).toBe(
      true,
    );

    drag.adapter.updateGesture({
      pointerId: 7,
      point: { x: 56, y: 64 },
      timestamp: 2,
    });

    expect(drag.getState().translation).toEqual({ x: 40, y: 40 });
    expect(drag.getState().activeSession?.layout).toEqual({
      x: 50,
      y: 60,
      width: 120,
      height: 48,
    });
    expect(drag.getState().activeSession?.metadata).toEqual({ order: 1 });

    const result = drag.adapter.endGesture({
      pointerId: 7,
      point: { x: 66, y: 74 },
      timestamp: 3,
    });

    expect(result).toEqual({
      reason: 'completed',
      session: expect.objectContaining({
        targetId: 'item-1',
        handleId: 'grip',
        translation: { x: 50, y: 50 },
        layout: { x: 60, y: 70, width: 120, height: 48 },
      }),
    });
    expect(drag.getState().activeSession).toBeNull();
    expect(drag.getState().lastResult?.reason).toBe('completed');
  });

  it('supports controlled layout syncing through the native adapter', () => {
    function Harness(): React.ReactElement {
      const { state, adapter } = useReactNativeMultiDrag<{ id: string }>({
        initialTargets: [
          {
            targetId: 'card-1',
            layout: { x: 0, y: 0, width: 40, height: 20 },
            metadata: { id: 'card-1' },
          },
          {
            targetId: 'card-2',
            handleId: 'handle',
            layout: { x: 100, y: 0, width: 40, height: 20 },
            metadata: { id: 'card-2' },
          },
        ],
      });

      return (
        <>
          <button
            type="button"
            onClick={() => {
              adapter.updateTargetLayout(
                'card-2',
                { x: 120, y: 8, width: 44, height: 24 },
                'handle',
              );
            }}
          >
            sync layout
          </button>
          <button
            type="button"
            onClick={() => {
              adapter.beginGesture({
                pointerId: 1,
                point: { x: 125, y: 10 },
                timestamp: 10,
                targetId: 'card-2',
                handleId: 'handle',
              });
            }}
          >
            start
          </button>
          <button
            type="button"
            onClick={() => {
              adapter.cancelGesture({ timestamp: 11 });
            }}
          >
            cancel
          </button>
          <pre data-testid="native-drag-state">{JSON.stringify(state)}</pre>
        </>
      );
    }

    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: 'sync layout' }));

    expect(screen.getByTestId('native-drag-state')).toHaveTextContent('"x":120');
    expect(screen.getByTestId('native-drag-state')).toHaveTextContent('"handleId":"handle"');

    fireEvent.click(screen.getByRole('button', { name: 'start' }));

    expect(screen.getByTestId('native-drag-state')).toHaveTextContent('"activeTargetId":"card-2"');
    expect(screen.getByTestId('native-drag-state')).toHaveTextContent('"activeHandleId":"handle"');

    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));

    expect(screen.getByTestId('native-drag-state')).toHaveTextContent('"reason":"cancelled"');
    expect(screen.getByTestId('native-drag-state')).toHaveTextContent('"activeSession":null');
  });
});
