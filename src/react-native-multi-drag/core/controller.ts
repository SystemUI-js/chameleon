import {
  GestureController,
  GesturePhase,
  PointerPhase,
  type GestureSnapshot,
  type NormalizedPointerInput,
  type Point,
  type Pose,
} from '@system-ui-js/multi-drag-core';
import type {
  ReactNativeMultiDragController,
  ReactNativeMultiDragControllerOptions,
  ReactNativeMultiDragEndInput,
  ReactNativeMultiDragEndReason,
  ReactNativeMultiDragEndResult,
  ReactNativeMultiDragLayoutMeasurement,
  ReactNativeMultiDragMetadata,
  ReactNativeMultiDragMoveInput,
  ReactNativeMultiDragSessionPhase,
  ReactNativeMultiDragSessionSnapshot,
  ReactNativeMultiDragStartInput,
  ReactNativeMultiDragState,
  ReactNativeMultiDragTargetRegistration,
  ReactNativeMultiDragTargetState,
  ReactNativeMultiDragTranslation,
} from '../types';

type RegisteredTarget<TMetadata> = ReactNativeMultiDragTargetRegistration<TMetadata>;

const ZERO_TRANSLATION: ReactNativeMultiDragTranslation = { x: 0, y: 0 };

function createTargetKey(targetId: string, handleId?: string): string {
  return handleId ? `${targetId}::${handleId}` : targetId;
}

function toPose(layout: ReactNativeMultiDragLayoutMeasurement): Pose {
  return {
    position: {
      x: layout.x,
      y: layout.y,
    },
    width: layout.width,
    height: layout.height,
  };
}

function getAnchorCenter(pose: Pose): Point {
  return {
    x: pose.position.x + pose.width / 2,
    y: pose.position.y + pose.height / 2,
  };
}

function toLayoutMeasurement(pose: Pose): ReactNativeMultiDragLayoutMeasurement {
  return {
    x: pose.position.x,
    y: pose.position.y,
    width: pose.width,
    height: pose.height,
  };
}

function createFallbackLayout(point: Point): ReactNativeMultiDragLayoutMeasurement {
  return {
    x: point.x,
    y: point.y,
    width: 0,
    height: 0,
  };
}

function toNormalizedPointerInput<TMetadata>(
  input:
    | ReactNativeMultiDragStartInput<TMetadata>
    | ReactNativeMultiDragMoveInput<TMetadata>
    | ReactNativeMultiDragEndInput<TMetadata>,
  phase: PointerPhase,
): NormalizedPointerInput {
  return {
    pointerId: input.pointerId,
    point: {
      x: input.point.x,
      y: input.point.y,
    },
    phase,
    timestamp: input.timestamp,
    pointerType: input.pointerType,
    isPrimary: input.isPrimary,
  };
}

function toSessionPhase(phase: GesturePhase): ReactNativeMultiDragSessionPhase {
  switch (phase) {
    case GesturePhase.Start:
      return 'start';
    case GesturePhase.Move:
      return 'move';
    case GesturePhase.End:
      return 'end';
    case GesturePhase.Cancel:
      return 'cancel';
    default:
      return 'idle';
  }
}

export function createReactNativeMultiDragController<TMetadata = ReactNativeMultiDragMetadata>(
  options: ReactNativeMultiDragControllerOptions<TMetadata> = {},
): ReactNativeMultiDragController<TMetadata> {
  const gestureController = new GestureController({
    features: {
      drag: true,
    },
  });
  const targets = new Map<string, RegisteredTarget<TMetadata>>();
  const listeners = new Set<(state: ReactNativeMultiDragState<TMetadata>) => void>();
  let sessionSequence = 0;
  let state: ReactNativeMultiDragState<TMetadata> = {
    activeSession: null,
    activeTargetId: null,
    activeHandleId: null,
    translation: ZERO_TRANSLATION,
    targets: [],
    lastResult: null,
  };

  options.initialTargets?.forEach((target) => {
    targets.set(createTargetKey(target.targetId, target.handleId), { ...target });
  });

  const emit = (): void => {
    state = {
      ...state,
      targets: Array.from(targets.values()).map((target) => ({
        ...target,
        active:
          state.activeTargetId === target.targetId &&
          (state.activeHandleId ?? undefined) === target.handleId,
      })) satisfies ReactNativeMultiDragTargetState<TMetadata>[],
    };

    for (const listener of listeners) {
      listener(state);
    }
  };

  const resolveTarget = (
    input:
      | ReactNativeMultiDragStartInput<TMetadata>
      | ReactNativeMultiDragMoveInput<TMetadata>
      | ReactNativeMultiDragEndInput<TMetadata>
      | undefined,
  ): RegisteredTarget<TMetadata> => {
    const targetId = input?.targetId ?? state.activeTargetId ?? '';
    const handleId = input?.handleId ?? state.activeHandleId ?? undefined;
    const existingTarget = targets.get(createTargetKey(targetId, handleId));

    return {
      targetId,
      handleId,
      layout:
        input?.layout ??
        existingTarget?.layout ??
        state.activeSession?.layout ??
        createFallbackLayout(input?.point ?? { x: 0, y: 0 }),
      metadata: input?.metadata ?? existingTarget?.metadata ?? state.activeSession?.metadata,
    };
  };

  const buildSession = (
    previousSession: ReactNativeMultiDragSessionSnapshot<TMetadata> | null,
    input:
      | ReactNativeMultiDragStartInput<TMetadata>
      | ReactNativeMultiDragMoveInput<TMetadata>
      | ReactNativeMultiDragEndInput<TMetadata>,
    snapshot: GestureSnapshot,
    target: RegisteredTarget<TMetadata>,
  ): ReactNativeMultiDragSessionSnapshot<TMetadata> => {
    const baseLayout = target.layout ?? createFallbackLayout(input.point);
    const layout = toLayoutMeasurement(snapshot.pose);
    const startPoint = previousSession?.startPoint ?? input.point;

    return {
      sessionId: previousSession?.sessionId ?? `rnmd-session-${++sessionSequence}`,
      pointerId: input.pointerId,
      targetId: target.targetId,
      handleId: target.handleId,
      phase: toSessionPhase(snapshot.phase),
      startedAt: previousSession?.startedAt ?? input.timestamp,
      updatedAt: input.timestamp,
      startPoint,
      currentPoint: input.point,
      translation: {
        x: layout.x - baseLayout.x,
        y: layout.y - baseLayout.y,
      },
      layout,
      metadata: target.metadata,
      pointerType: input.pointerType ?? previousSession?.pointerType,
      isPrimary: input.isPrimary ?? previousSession?.isPrimary,
    };
  };

  const closeSession = (
    reason: ReactNativeMultiDragEndReason,
    nextSession?: ReactNativeMultiDragSessionSnapshot<TMetadata> | null,
  ): ReactNativeMultiDragEndResult<TMetadata> | null => {
    const closingSession = nextSession ?? state.activeSession;

    if (!closingSession) {
      return null;
    }

    const result = {
      session: closingSession,
      reason,
    } satisfies ReactNativeMultiDragEndResult<TMetadata>;

    state = {
      ...state,
      activeSession: null,
      activeTargetId: null,
      activeHandleId: null,
      translation: ZERO_TRANSLATION,
      lastResult: result,
    };

    emit();
    return result;
  };

  emit();

  return {
    registerTarget(target): void {
      targets.set(createTargetKey(target.targetId, target.handleId), { ...target });
      emit();
    },

    unregisterTarget(targetId, handleId): void {
      targets.delete(createTargetKey(targetId, handleId));
      emit();
    },

    getState(): ReactNativeMultiDragState<TMetadata> {
      return state;
    },

    subscribe(listener): () => void {
      listeners.add(listener);
      listener(state);

      return () => {
        listeners.delete(listener);
      };
    },

    startSession(input): ReactNativeMultiDragState<TMetadata> {
      if (state.activeSession) {
        closeSession('interrupted');
      }

      gestureController.reset();
      const target = resolveTarget(input);
      const pose = toPose(target.layout ?? createFallbackLayout(input.point));
      const snapshot = gestureController.process(
        toNormalizedPointerInput(input, PointerPhase.Start),
        {
          pose,
          anchorCenter: getAnchorCenter(pose),
        },
      );
      const activeSession = buildSession(null, input, snapshot, target);

      state = {
        ...state,
        activeSession,
        activeTargetId: activeSession.targetId,
        activeHandleId: activeSession.handleId ?? null,
        translation: activeSession.translation,
      };
      emit();
      return state;
    },

    updateSession(input): ReactNativeMultiDragState<TMetadata> {
      const currentSession = state.activeSession;

      if (!currentSession || currentSession.pointerId !== input.pointerId) {
        return state;
      }

      const target = resolveTarget({
        ...input,
        targetId: input.targetId ?? currentSession.targetId,
      });
      const snapshot = gestureController.process(
        toNormalizedPointerInput(
          {
            ...input,
            targetId: target.targetId,
          },
          PointerPhase.Move,
        ),
        {
          pose: toPose(currentSession.layout),
          anchorCenter: getAnchorCenter(toPose(currentSession.layout)),
        },
      );
      const activeSession = buildSession(
        currentSession,
        {
          ...input,
          targetId: target.targetId,
        },
        snapshot,
        target,
      );

      state = {
        ...state,
        activeSession,
        activeTargetId: activeSession.targetId,
        activeHandleId: activeSession.handleId ?? null,
        translation: activeSession.translation,
      };
      emit();
      return state;
    },

    endSession(input): ReactNativeMultiDragEndResult<TMetadata> | null {
      const currentSession = state.activeSession;

      if (!currentSession || currentSession.pointerId !== input.pointerId) {
        return null;
      }

      const target = resolveTarget({
        ...input,
        targetId: input.targetId ?? currentSession.targetId,
      });
      const snapshot = gestureController.process(
        toNormalizedPointerInput(
          {
            ...input,
            targetId: target.targetId,
          },
          PointerPhase.End,
        ),
        {
          pose: toPose(currentSession.layout),
          anchorCenter: getAnchorCenter(toPose(currentSession.layout)),
        },
      );
      const finalSession = buildSession(
        currentSession,
        {
          ...input,
          targetId: target.targetId,
        },
        snapshot,
        target,
      );

      return closeSession('completed', finalSession);
    },

    cancelSession(input): ReactNativeMultiDragEndResult<TMetadata> | null {
      const currentSession = state.activeSession;

      if (!currentSession) {
        return null;
      }

      const cancelInput = {
        pointerId: input?.pointerId ?? currentSession.pointerId,
        point: input?.point ?? currentSession.currentPoint,
        timestamp: input?.timestamp ?? currentSession.updatedAt,
        targetId: input?.targetId ?? currentSession.targetId,
        handleId: input?.handleId ?? currentSession.handleId,
        layout: input?.layout ?? currentSession.layout,
        metadata: input?.metadata ?? currentSession.metadata,
        pointerType: input?.pointerType ?? currentSession.pointerType,
        isPrimary: input?.isPrimary ?? currentSession.isPrimary,
      } satisfies ReactNativeMultiDragEndInput<TMetadata>;
      const target = resolveTarget(cancelInput);
      const snapshot = gestureController.process(
        toNormalizedPointerInput(cancelInput, PointerPhase.Cancel),
        {
          pose: toPose(currentSession.layout),
          anchorCenter: getAnchorCenter(toPose(currentSession.layout)),
        },
      );
      const finalSession = buildSession(currentSession, cancelInput, snapshot, target);

      return closeSession('cancelled', finalSession);
    },
  };
}
