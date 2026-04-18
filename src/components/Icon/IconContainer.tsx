import React from 'react';
import { Pressable, View } from 'react-native';
import {
  CIcon,
  type CIconActiveTrigger,
  type CIconOpenTrigger,
  type CIconPosition,
  type CIconProps,
} from './Icon';

export type { CIconActiveTrigger, CIconOpenTrigger };

export interface CIconContainerConfig {
  position?: CIconPosition;
  activeTrigger?: CIconActiveTrigger;
  openTrigger?: CIconOpenTrigger;
}

export type CIconContainerItem = CIconProps;

export interface CIconContainerProps {
  iconList: readonly CIconContainerItem[];
  config?: CIconContainerConfig;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

function getMergedPosition(
  item: CIconContainerItem,
  config: CIconContainerConfig | undefined,
): CIconPosition | undefined {
  return item.position ?? config?.position;
}

export function CIconContainer({
  iconList,
  config,
  'data-testid': dataTestId,
}: CIconContainerProps): React.ReactElement {
  const controlledActiveIndex = iconList.findIndex((item) => item.active);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(
    controlledActiveIndex >= 0 ? controlledActiveIndex : null,
  );

  React.useEffect(() => {
    if (controlledActiveIndex >= 0) {
      setActiveIndex(controlledActiveIndex);
    }
  }, [controlledActiveIndex]);

  return (
    <View testID={dataTestId ?? 'icon-container'}>
      {iconList.map((item, index) => {
        const { onActive, ...restItemProps } = item;
        const position = getMergedPosition(item, config);
        const isActive = index === activeIndex;
        const key = item['data-testid'] ?? `icon-item-${index}`;

        return (
          <Pressable
            key={key}
            testID={`icon-slot-${index}`}
            onPress={() => {
              const nextActive = !isActive;
              setActiveIndex(nextActive ? index : null);
              onActive?.(nextActive);
            }}
          >
            <CIcon
              {...restItemProps}
              data-testid={`icon-item-${index}`}
              position={position}
              active={isActive}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
