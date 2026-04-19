import {
  GestureController,
  PointerPhase,
  type GestureSnapshot,
  type NormalizedPointerInput,
  type Pose,
} from '@system-ui-js/multi-drag-core';

export type { Pose };

export enum DragOperationType {
  Start = 'start',
  Move = 'move',
  End = 'end',
  Inertial = 'inertial',
  InertialEnd = 'inertialEnd',
  AllEnd = 'allEnd',
}

type DragListener = () => void;

export interface DragOptions {
  getPose: (element: HTMLElement) => Pose;
  setPose?: (element: HTMLElement, pose: Partial<Pose>) => void;
  setPoseOnEnd?: (element: HTMLElement, pose: Partial<Pose>) => void;
}

function getTimestamp(source: Pick<PointerEvent, 'timeStamp'>): number {
  return Number.isFinite(source.timeStamp) && source.timeStamp > 0 ? source.timeStamp : Date.now();
}

function getAnchorCenter(pose: Pose): Pose['position'] {
  return {
    x: pose.position.x + pose.width / 2,
    y: pose.position.y + pose.height / 2,
  };
}

function toNormalizedPointerInput(
  event: PointerEvent,
  phase: PointerPhase,
): NormalizedPointerInput {
  return {
    pointerId: event.pointerId,
    point: {
      x: event.clientX,
      y: event.clientY,
    },
    phase,
    timestamp: getTimestamp(event),
    pointerType: event.pointerType,
    isPrimary: event.isPrimary,
  };
}

export class Drag {
  private readonly controller = new GestureController({
    features: {
      drag: true,
    },
  });

  private readonly listeners = new Map<DragOperationType, Set<DragListener>>();
  private disabled = false;
  private activePointerId: number | null = null;

  public constructor(
    private readonly element: HTMLElement,
    private readonly options: DragOptions,
  ) {
    this.element.style.touchAction = 'none';
    this.element.addEventListener('pointerdown', this.handlePointerDown);
  }

  public addEventListener(type: DragOperationType, listener: DragListener): void {
    const currentListeners = this.listeners.get(type) ?? new Set<DragListener>();
    currentListeners.add(listener);
    this.listeners.set(type, currentListeners);
  }

  public removeEventListener(type: DragOperationType, listener?: DragListener): void {
    const currentListeners = this.listeners.get(type);

    if (!currentListeners) {
      return;
    }

    if (!listener) {
      currentListeners.clear();
      return;
    }

    currentListeners.delete(listener);
  }

  public setDisabled(): void {
    if (this.disabled) {
      return;
    }

    this.disabled = true;
    this.activePointerId = null;
    this.controller.reset();
    this.detachRuntimeListeners();
    this.element.removeEventListener('pointerdown', this.handlePointerDown);
  }

  private emit(type: DragOperationType): void {
    for (const listener of this.listeners.get(type) ?? []) {
      listener();
    }
  }

  private handlePointerDown = (event: PointerEvent): void => {
    if (this.disabled || this.activePointerId !== null || event.button !== 0) {
      return;
    }

    this.activePointerId = event.pointerId;

    try {
      this.element.setPointerCapture(event.pointerId);
    } catch {
      // Ignore pointer capture failures in unsupported environments.
    }

    const pose = this.options.getPose(this.element);
    this.controller.reset();
    this.controller.process(toNormalizedPointerInput(event, PointerPhase.Start), {
      pose,
      anchorCenter: getAnchorCenter(pose),
    });
    this.attachRuntimeListeners();
    this.emit(DragOperationType.Start);
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (this.disabled || event.pointerId !== this.activePointerId) {
      return;
    }

    const snapshot = this.processPointerEvent(event, PointerPhase.Move);
    this.options.setPose?.(this.element, snapshot.pose);
    this.emit(DragOperationType.Move);
  };

  private handlePointerUp = (event: PointerEvent): void => {
    this.finalizePointerEvent(event, PointerPhase.End, DragOperationType.End);
  };

  private handlePointerCancel = (event: PointerEvent): void => {
    this.finalizePointerEvent(event, PointerPhase.Cancel, DragOperationType.End);
  };

  private processPointerEvent(event: PointerEvent, phase: PointerPhase): GestureSnapshot {
    const pose = this.options.getPose(this.element);

    return this.controller.process(toNormalizedPointerInput(event, phase), {
      pose,
      anchorCenter: getAnchorCenter(pose),
    });
  }

  private finalizePointerEvent(
    event: PointerEvent,
    phase: PointerPhase,
    operationType: DragOperationType,
  ): void {
    if (this.disabled || event.pointerId !== this.activePointerId) {
      return;
    }

    const snapshot = this.processPointerEvent(event, phase);

    try {
      this.element.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore pointer capture release failures in unsupported environments.
    }

    this.activePointerId = null;
    this.detachRuntimeListeners();
    this.options.setPoseOnEnd?.(this.element, snapshot.pose);
    this.emit(operationType);
    this.emit(DragOperationType.AllEnd);
  }

  private attachRuntimeListeners(): void {
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerCancel);
  }

  private detachRuntimeListeners(): void {
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerCancel);
  }
}
