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

function normalizeSliderValue(value: number, range: SliderRange): number {
  const safeValue = Number.isFinite(value) ? value : range.min;
  const clampedValue = clamp(safeValue, range.min, range.max);

  if (range.step === undefined || range.max === range.min) {
    return clampedValue;
  }

  const alignedStepCount = Math.round((clampedValue - range.min) / range.step);
  const precision = getValuePrecision(range);
  const alignedValue = range.min + alignedStepCount * range.step;

  return clamp(roundToPrecision(alignedValue, precision), range.min, range.max);
}

function valueToPercent(value: number, range: SliderRange): number {
  if (range.max === range.min) {
    return 0;
  }

  return ((normalizeSliderValue(value, range) - range.min) / (range.max - range.min)) * 100;
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
  const latestValueRef = React.useRef(normalizedValue);

  React.useEffect(() => {
    latestValueRef.current = normalizedValue;
  }, [normalizedValue]);

  const emitChange = React.useCallback(
    (nextValue: number) => {
      const constrainedValue = normalizeSliderValue(nextValue, range);

      if (latestValueRef.current === constrainedValue) {
        return;
      }

      latestValueRef.current = constrainedValue;
      onChange?.(constrainedValue);
    },
    [onChange, range],
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

      dragSessionRef.current = {
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
        );
      },
      setPoseOnEnd: (_element, pose) => {
        const dragSession = dragSessionRef.current;

        if (!dragSession || !pose.position) {
          dragSessionRef.current = null;
          return;
        }

        emitChange(
          clientXToValue(
            pose.position.x + dragSession.thumbWidth / 2,
            dragSession.trackRect,
            range,
          ),
        );
        dragSessionRef.current = null;
      },
    });

    return () => {
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
          aria-hidden="true"
          className={mergeClasses(['cm-cslider__thumb'], undefined, classNames?.thumb)}
          data-slider-thumb="true"
          style={thumbStyle}
        />
      </div>
    </div>
  );
}
