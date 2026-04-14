import { Drag, type Pose } from '@system-ui-js/multi-drag';
import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CSliderClassNames {
  readonly track?: string;
  readonly fill?: string;
  readonly thumb?: string;
}

export interface CSliderProps {
  readonly min?: number;
  readonly max?: number;
  readonly value: number;
  readonly step?: number;
  readonly disabled?: boolean;
  readonly onChange?: (value: number) => void;
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
  readonly 'aria-valuetext'?: string;
  readonly className?: string;
  readonly classNames?: CSliderClassNames;
  readonly theme?: string;
  readonly style?: React.CSSProperties;
  readonly 'data-testid'?: string;
}

type SliderRange = {
  readonly min: number;
  readonly max: number;
  readonly step?: number;
};

type DragSession = {
  readonly id: number;
  readonly trackRect: DOMRect;
  readonly thumbWidth: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getPrecision(value: number): number {
  const normalizedValue = value.toString().toLowerCase();

  if (normalizedValue.includes('e-')) {
    const [base, exponent] = normalizedValue.split('e-');
    const exponentValue = Number.parseInt(exponent ?? '0', 10);
    const decimalPartLength = base.split('.')[1]?.length ?? 0;

    return exponentValue + decimalPartLength;
  }

  return normalizedValue.split('.')[1]?.length ?? 0;
}

function roundToPrecision(value: number, precision: number): number {
  if (precision <= 0) {
    return Math.round(value);
  }

  const factor = 10 ** precision;

  return Math.round(value * factor) / factor;
}

function resolveSliderRange(
  min: number | undefined,
  max: number | undefined,
  step?: number,
): SliderRange {
  const resolvedMin = typeof min === 'number' && Number.isFinite(min) ? min : 0;
  const resolvedMaxCandidate = typeof max === 'number' && Number.isFinite(max) ? max : 100;
  const resolvedMax = resolvedMaxCandidate >= resolvedMin ? resolvedMaxCandidate : resolvedMin;
  const resolvedStep =
    typeof step === 'number' && Number.isFinite(step) && step > 0 ? step : undefined;

  return {
    min: resolvedMin,
    max: resolvedMax,
    step: resolvedStep,
  } satisfies SliderRange;
}

function getValuePrecision(range: SliderRange): number {
  return Math.max(
    getPrecision(range.min),
    getPrecision(range.max),
    range.step !== undefined ? getPrecision(range.step) : 0,
  );
}

function toScaledInteger(value: number, precision: number): number {
  if (precision <= 0) {
    return Math.round(value);
  }

  const factor = 10 ** precision;

  return Math.round(value * factor);
}

function normalizeSliderValue(value: number, range: SliderRange): number {
  const safeValue = Number.isFinite(value) ? value : range.min;
  const clampedValue = clamp(safeValue, range.min, range.max);

  if (range.step === undefined || range.max === range.min) {
    return clampedValue;
  }

  const precision = getValuePrecision(range);
  const factor = 10 ** precision;
  const scaledMin = toScaledInteger(range.min, precision);
  const scaledStep = toScaledInteger(range.step, precision);
  const scaledClampedValue = toScaledInteger(clampedValue, precision);
  const alignedStepCount = Math.round((scaledClampedValue - scaledMin) / scaledStep);
  const alignedValue = (scaledMin + alignedStepCount * scaledStep) / factor;

  return clamp(roundToPrecision(alignedValue, precision), range.min, range.max);
}

function valueToPercent(value: number, range: SliderRange): number {
  if (range.max === range.min) {
    return 0;
  }

  return roundToPrecision(
    ((normalizeSliderValue(value, range) - range.min) / (range.max - range.min)) * 100,
    Math.max(getValuePrecision(range) + 2, 4),
  );
}

function clientXToValue(clientX: number, trackRect: DOMRect, range: SliderRange): number {
  if (trackRect.width <= 0 || range.max === range.min) {
    return normalizeSliderValue(range.min, range);
  }

  const ratio = clamp((clientX - trackRect.left) / trackRect.width, 0, 1);
  const value = range.min + ratio * (range.max - range.min);

  return normalizeSliderValue(value, range);
}

export function CSlider({
  min = 0,
  max = 100,
  value,
  step,
  disabled = false,
  onChange,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-valuetext': ariaValueText,
  className,
  classNames,
  theme,
  style,
  'data-testid': dataTestId,
}: CSliderProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const range = React.useMemo(() => resolveSliderRange(min, max, step), [max, min, step]);
  const normalizedValue = React.useMemo(() => normalizeSliderValue(value, range), [range, value]);
  const percent = React.useMemo(
    () => valueToPercent(normalizedValue, range),
    [normalizedValue, range],
  );
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const thumbRef = React.useRef<HTMLDivElement | null>(null);
  const dragSessionRef = React.useRef<DragSession | null>(null);
  const dragSessionIdRef = React.useRef(0);
  const latestDragValueRef = React.useRef<{ sessionId: number; value: number } | null>(null);
  const normalizedValueRef = React.useRef(normalizedValue);
  const onChangeRef = React.useRef(onChange);

  normalizedValueRef.current = normalizedValue;
  onChangeRef.current = onChange;

  const emitChange = React.useCallback(
    (nextValue: number, dragSessionId?: number) => {
      const constrainedValue = normalizeSliderValue(nextValue, range);

      if (normalizedValueRef.current === constrainedValue) {
        return;
      }

      if (dragSessionId !== undefined) {
        const latestDragValue = latestDragValueRef.current;

        if (
          latestDragValue?.sessionId === dragSessionId &&
          latestDragValue.value === constrainedValue
        ) {
          return;
        }

        latestDragValueRef.current = {
          sessionId: dragSessionId,
          value: constrainedValue,
        };
      }

      onChangeRef.current?.(constrainedValue);
    },
    [range],
  );

  const handleThumbKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      const span = range.max - range.min;
      const continuousPrecision = Math.max(getValuePrecision(range) + 2, 2);
      const defaultKeyboardStep =
        span <= 0 ? 0 : span < 1 ? roundToPrecision(span / 100, continuousPrecision) : 1;
      const defaultPageStep =
        span <= 0
          ? 0
          : span < 1
            ? roundToPrecision(span / 10, continuousPrecision)
            : Math.max(span / 10, 1);
      const keyboardStep = range.step ?? defaultKeyboardStep;
      const pageStep = range.step !== undefined ? range.step * 10 : defaultPageStep;
      const offsetValue = (delta: number): number =>
        roundToPrecision(normalizedValue + delta, continuousPrecision);

      let nextValue: number | null = null;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          nextValue = offsetValue(-keyboardStep);
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          nextValue = offsetValue(keyboardStep);
          break;
        case 'Home':
          nextValue = range.min;
          break;
        case 'End':
          nextValue = range.max;
          break;
        case 'PageDown':
          nextValue = offsetValue(-pageStep);
          break;
        case 'PageUp':
          nextValue = offsetValue(pageStep);
          break;
        default:
          return;
      }

      event.preventDefault();
      emitChange(nextValue);
    },
    [disabled, emitChange, normalizedValue, range],
  );

  React.useEffect(() => {
    const thumbElement = thumbRef.current;

    if (!thumbElement || disabled) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      if (event.button !== 0) {
        return;
      }

      const trackElement = trackRef.current;

      if (!trackElement) {
        return;
      }

      const thumbRect = thumbElement.getBoundingClientRect();
      const nextSessionId = dragSessionIdRef.current + 1;

      dragSessionIdRef.current = nextSessionId;
      latestDragValueRef.current = null;

      dragSessionRef.current = {
        id: nextSessionId,
        trackRect: trackElement.getBoundingClientRect(),
        thumbWidth: thumbRect.width,
      } satisfies DragSession;
    };

    thumbElement.addEventListener('pointerdown', handlePointerDown);

    const drag = new Drag(thumbElement, {
      getPose: (element) => {
        const rect = element.getBoundingClientRect();

        return {
          position: { x: rect.left, y: rect.top },
          width: rect.width,
          height: rect.height,
        } satisfies Pose;
      },
      setPose: (_element, pose) => {
        const dragSession = dragSessionRef.current;

        if (!dragSession || !pose.position) {
          return;
        }

        emitChange(
          clientXToValue(
            pose.position.x + dragSession.thumbWidth / 2,
            dragSession.trackRect,
            range,
          ),
          dragSession.id,
        );
      },
      setPoseOnEnd: (_element, pose) => {
        const dragSession = dragSessionRef.current;

        if (!dragSession || !pose.position) {
          latestDragValueRef.current = null;
          dragSessionRef.current = null;
          return;
        }

        emitChange(
          clientXToValue(
            pose.position.x + dragSession.thumbWidth / 2,
            dragSession.trackRect,
            range,
          ),
          dragSession.id,
        );
        latestDragValueRef.current = null;
        dragSessionRef.current = null;
      },
    });

    return () => {
      latestDragValueRef.current = null;
      dragSessionRef.current = null;
      thumbElement.removeEventListener('pointerdown', handlePointerDown);
      drag.setDisabled();
    };
  }, [disabled, emitChange, range]);

  const handleTrackPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || event.button !== 0 || event.target === thumbRef.current) {
        return;
      }

      const trackElement = trackRef.current;

      if (!trackElement) {
        return;
      }

      emitChange(clientXToValue(event.clientX, trackElement.getBoundingClientRect(), range));
      thumbRef.current?.focus();
    },
    [disabled, emitChange, range],
  );

  const fillStyle = {
    width: `${percent}%`,
  } satisfies React.CSSProperties;

  const thumbStyle = {
    left: `${percent}%`,
  } satisfies React.CSSProperties;

  return (
    <div
      data-testid={dataTestId}
      className={mergeClasses(
        ['cm-cslider', disabled ? 'cm-cslider--disabled' : 'cm-cslider--enabled'],
        resolvedTheme,
        className,
      )}
      style={style}
    >
      <div
        ref={trackRef}
        className={mergeClasses(['cm-cslider__track'], undefined, classNames?.track)}
        data-slider-track="true"
        onPointerDown={handleTrackPointerDown}
      >
        <div
          className={mergeClasses(['cm-cslider__fill'], undefined, classNames?.fill)}
          data-slider-fill="true"
          style={fillStyle}
        />
        <div
          ref={thumbRef}
          role="slider"
          aria-disabled={disabled || undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-orientation="horizontal"
          aria-valuemax={range.max}
          aria-valuemin={range.min}
          aria-valuenow={normalizedValue}
          aria-valuetext={ariaValueText}
          className={mergeClasses(['cm-cslider__thumb'], undefined, classNames?.thumb)}
          data-slider-thumb="true"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleThumbKeyDown}
          style={thumbStyle}
        />
      </div>
    </div>
  );
}
