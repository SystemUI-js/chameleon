import type {
  ReactNativeMultiDragController,
  ReactNativeMultiDragEndInput,
  ReactNativeMultiDragLayoutMeasurement,
  ReactNativeMultiDragMetadata,
  ReactNativeMultiDragMoveInput,
  ReactNativeMultiDragNativeAdapter,
  ReactNativeMultiDragStartInput,
} from '../types';

export function createReactNativeMultiDragNativeAdapter<TMetadata = ReactNativeMultiDragMetadata>(
  controller: ReactNativeMultiDragController<TMetadata>,
): ReactNativeMultiDragNativeAdapter<TMetadata> {
  return {
    registerTarget(target): void {
      controller.registerTarget(target);
    },

    updateTargetLayout(
      targetId: string,
      layout: ReactNativeMultiDragLayoutMeasurement,
      handleId?: string,
    ): void {
      const existingTarget = controller
        .getState()
        .targets.find(
          (target) => target.targetId === targetId && (target.handleId ?? undefined) === handleId,
        );

      controller.registerTarget({
        targetId,
        handleId,
        layout,
        metadata: existingTarget?.metadata,
      });
    },

    removeTarget(targetId: string, handleId?: string): void {
      controller.unregisterTarget(targetId, handleId);
    },

    beginGesture(input: ReactNativeMultiDragStartInput<TMetadata>) {
      return controller.startSession(input);
    },

    updateGesture(input: ReactNativeMultiDragMoveInput<TMetadata>) {
      return controller.updateSession(input);
    },

    endGesture(input: ReactNativeMultiDragEndInput<TMetadata>) {
      return controller.endSession(input);
    },

    cancelGesture(input) {
      return controller.cancelSession(input);
    },
  };
}
