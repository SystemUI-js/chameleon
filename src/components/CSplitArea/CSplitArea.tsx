import React from 'react';
import { Pressable, View } from 'react-native';

export type CSplitAreaDirection = 'horizontal' | 'vertical';

export interface CSplitAreaProps {
  readonly children?: React.ReactNode;
  readonly direction?: CSplitAreaDirection;
  readonly separatorMovable?: boolean;
  readonly className?: string;
  readonly theme?: string;
  readonly style?: React.CSSProperties;
  readonly 'data-testid'?: string;
}

function createEqualRatios(count: number): number[] {
  if (count <= 0) return [];
  return Array.from({ length: count }, () => 1 / count);
}

export function CSplitArea({
  children,
  direction = 'horizontal',
  separatorMovable = false,
  'data-testid': dataTestId,
}: CSplitAreaProps): React.ReactElement {
  const items = React.Children.toArray(children).filter(Boolean);
  const [ratios, setRatios] = React.useState<number[]>(() => createEqualRatios(items.length));

  React.useEffect(() => {
    setRatios(createEqualRatios(items.length));
  }, [items.length]);

  return (
    <View
      testID={dataTestId}
      style={{ flexDirection: direction === 'horizontal' ? 'row' : 'column' }}
    >
      {items.map((item, index) => {
        const key =
          React.isValidElement(item) && item.key !== null ? String(item.key) : `panel-${index}`;

        return (
          <React.Fragment key={key}>
            <View
              testID={`${dataTestId ?? 'split-area'}-panel-${index}`}
              style={{ flex: ratios[index] ?? 0 }}
            >
              {item}
            </View>
            {index < items.length - 1 ? (
              <Pressable
                testID={`${dataTestId ?? 'split-area'}-separator-${index}`}
                onPress={
                  separatorMovable ? () => setRatios(createEqualRatios(items.length)) : undefined
                }
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}
