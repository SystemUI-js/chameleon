import React from 'react';
import { Pressable, View } from 'react-native';

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

type SliderRange = { readonly min: number; readonly max: number; readonly step?: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function resolveSliderRange(
  min: number | undefined,
  max: number | undefined,
  step?: number,
): SliderRange {
  return {
    min: typeof min === 'number' ? min : 0,
    max: typeof max === 'number' ? Math.max(max, min ?? 0) : 100,
    step: typeof step === 'number' && step > 0 ? step : undefined,
  };
}

function normalizeSliderValue(value: number, range: SliderRange): number {
  const clamped = clamp(value, range.min, range.max);
  if (!range.step) {
    return clamped;
  }
  const steps = Math.round((clamped - range.min) / range.step);
  return clamp(range.min + steps * range.step, range.min, range.max);
}

function valueToPercent(value: number, range: SliderRange): number {
  if (range.max === range.min) return 0;
  return ((normalizeSliderValue(value, range) - range.min) / (range.max - range.min)) * 100;
}

export function CSlider({
  min = 0,
  max = 100,
  value,
  step,
  disabled = false,
  onChange,
  'data-testid': dataTestId,
}: CSliderProps): React.ReactElement {
  const range = React.useMemo(() => resolveSliderRange(min, max, step), [max, min, step]);
  const normalizedValue = React.useMemo(() => normalizeSliderValue(value, range), [range, value]);
  const percent = React.useMemo(
    () => valueToPercent(normalizedValue, range),
    [normalizedValue, range],
  );
  const delta = range.step ?? Math.max((range.max - range.min) / 10, 1);

  return (
    <View testID={dataTestId} style={{ width: '100%' }}>
      <Pressable
        testID={`${dataTestId ?? 'slider'}-track`}
        disabled={disabled}
        onPress={() => onChange?.(normalizeSliderValue(normalizedValue + delta, range))}
      >
        <View testID={`${dataTestId ?? 'slider'}-fill`} style={{ width: `${percent}%` }} />
        <View testID={`${dataTestId ?? 'slider'}-thumb`} />
      </Pressable>
    </View>
  );
}
