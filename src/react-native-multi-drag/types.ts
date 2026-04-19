export interface ReactNativeMultiDragPoint {
  readonly x: number;
  readonly y: number;
}

export interface ReactNativeMultiDragTranslation {
  readonly x: number;
  readonly y: number;
}

export interface ReactNativeMultiDragLayoutMeasurement {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type ReactNativeMultiDragMetadata = Record<string, unknown>;

export type ReactNativeMultiDragSessionPhase = 'idle' | 'start' | 'move' | 'end' | 'cancel';

export type ReactNativeMultiDragEndReason = 'completed' | 'cancelled' | 'interrupted';

export interface ReactNativeMultiDragTargetRegistration<TMetadata = ReactNativeMultiDragMetadata> {
  readonly targetId: string;
  readonly handleId?: string;
  readonly layout?: ReactNativeMultiDragLayoutMeasurement;
  readonly metadata?: TMetadata;
}

export interface ReactNativeMultiDragTargetState<TMetadata = ReactNativeMultiDragMetadata>
  extends ReactNativeMultiDragTargetRegistration<TMetadata> {
  readonly active: boolean;
}

export interface ReactNativeMultiDragBaseInput<TMetadata = ReactNativeMultiDragMetadata> {
  readonly pointerId: number;
  readonly point: ReactNativeMultiDragPoint;
  readonly timestamp: number;
  readonly targetId: string;
  readonly handleId?: string;
  readonly layout?: ReactNativeMultiDragLayoutMeasurement;
  readonly metadata?: TMetadata;
  readonly pointerType?: string;
  readonly isPrimary?: boolean;
}

export type ReactNativeMultiDragStartInput<TMetadata = ReactNativeMultiDragMetadata> =
  ReactNativeMultiDragBaseInput<TMetadata>;

export interface ReactNativeMultiDragMoveInput<TMetadata = ReactNativeMultiDragMetadata> {
  readonly pointerId: number;
  readonly point: ReactNativeMultiDragPoint;
  readonly timestamp: number;
  readonly targetId?: string;
  readonly handleId?: string;
  readonly layout?: ReactNativeMultiDragLayoutMeasurement;
  readonly metadata?: TMetadata;
  readonly pointerType?: string;
  readonly isPrimary?: boolean;
}

export type ReactNativeMultiDragEndInput<TMetadata = ReactNativeMultiDragMetadata> =
  ReactNativeMultiDragMoveInput<TMetadata>;

export type ReactNativeMultiDragCancelInput<TMetadata = ReactNativeMultiDragMetadata> = Partial<
  ReactNativeMultiDragMoveInput<TMetadata>
>;

export interface ReactNativeMultiDragSessionSnapshot<TMetadata = ReactNativeMultiDragMetadata> {
  readonly sessionId: string;
  readonly pointerId: number;
  readonly targetId: string;
  readonly handleId?: string;
  readonly phase: ReactNativeMultiDragSessionPhase;
  readonly startedAt: number;
  readonly updatedAt: number;
  readonly startPoint: ReactNativeMultiDragPoint;
  readonly currentPoint: ReactNativeMultiDragPoint;
  readonly translation: ReactNativeMultiDragTranslation;
  readonly layout: ReactNativeMultiDragLayoutMeasurement;
  readonly metadata?: TMetadata;
  readonly pointerType?: string;
  readonly isPrimary?: boolean;
}

export interface ReactNativeMultiDragEndResult<TMetadata = ReactNativeMultiDragMetadata> {
  readonly session: ReactNativeMultiDragSessionSnapshot<TMetadata>;
  readonly reason: ReactNativeMultiDragEndReason;
}

export interface ReactNativeMultiDragState<TMetadata = ReactNativeMultiDragMetadata> {
  readonly activeSession: ReactNativeMultiDragSessionSnapshot<TMetadata> | null;
  readonly activeTargetId: string | null;
  readonly activeHandleId: string | null;
  readonly translation: ReactNativeMultiDragTranslation;
  readonly targets: readonly ReactNativeMultiDragTargetState<TMetadata>[];
  readonly lastResult: ReactNativeMultiDragEndResult<TMetadata> | null;
}

export interface ReactNativeMultiDragControllerOptions<TMetadata = ReactNativeMultiDragMetadata> {
  readonly initialTargets?: readonly ReactNativeMultiDragTargetRegistration<TMetadata>[];
}

export interface ReactNativeMultiDragController<TMetadata = ReactNativeMultiDragMetadata> {
  registerTarget(target: ReactNativeMultiDragTargetRegistration<TMetadata>): void;
  unregisterTarget(targetId: string, handleId?: string): void;
  getState(): ReactNativeMultiDragState<TMetadata>;
  subscribe(listener: (state: ReactNativeMultiDragState<TMetadata>) => void): () => void;
  startSession(
    input: ReactNativeMultiDragStartInput<TMetadata>,
  ): ReactNativeMultiDragState<TMetadata>;
  updateSession(
    input: ReactNativeMultiDragMoveInput<TMetadata>,
  ): ReactNativeMultiDragState<TMetadata>;
  endSession(
    input: ReactNativeMultiDragEndInput<TMetadata>,
  ): ReactNativeMultiDragEndResult<TMetadata> | null;
  cancelSession(
    input?: ReactNativeMultiDragCancelInput<TMetadata>,
  ): ReactNativeMultiDragEndResult<TMetadata> | null;
}

export interface ReactNativeMultiDragNativeAdapter<TMetadata = ReactNativeMultiDragMetadata> {
  registerTarget(target: ReactNativeMultiDragTargetRegistration<TMetadata>): void;
  updateTargetLayout(
    targetId: string,
    layout: ReactNativeMultiDragLayoutMeasurement,
    handleId?: string,
  ): void;
  removeTarget(targetId: string, handleId?: string): void;
  beginGesture(
    input: ReactNativeMultiDragStartInput<TMetadata>,
  ): ReactNativeMultiDragState<TMetadata>;
  updateGesture(
    input: ReactNativeMultiDragMoveInput<TMetadata>,
  ): ReactNativeMultiDragState<TMetadata>;
  endGesture(
    input: ReactNativeMultiDragEndInput<TMetadata>,
  ): ReactNativeMultiDragEndResult<TMetadata> | null;
  cancelGesture(
    input?: ReactNativeMultiDragCancelInput<TMetadata>,
  ): ReactNativeMultiDragEndResult<TMetadata> | null;
}

export interface ReactNativeMultiDragFacade<TMetadata = ReactNativeMultiDragMetadata> {
  readonly controller: ReactNativeMultiDragController<TMetadata>;
  readonly adapter: ReactNativeMultiDragNativeAdapter<TMetadata>;
  getState(): ReactNativeMultiDragState<TMetadata>;
  subscribe(listener: (state: ReactNativeMultiDragState<TMetadata>) => void): () => void;
}

export interface UseReactNativeMultiDragResult<TMetadata = ReactNativeMultiDragMetadata>
  extends ReactNativeMultiDragFacade<TMetadata> {
  readonly state: ReactNativeMultiDragState<TMetadata>;
}
