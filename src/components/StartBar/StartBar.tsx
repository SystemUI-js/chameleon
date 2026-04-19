import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { CWidget, type CWidgetProps, type WidgetState } from '../Widget/Widget';

type StartBarState = WidgetState & { resolvedHeight?: number };

export interface CStartBarProps extends Omit<CWidgetProps, 'x' | 'y' | 'width'> {
  children?: React.ReactNode;
  className?: string;
  theme?: string;
  style?: React.CSSProperties;
  height?: number;
  defaultHeight?: number;
  gapStart?: number;
  gapEnd?: number;
  startLabel?: string;
  'data-testid'?: string;
}

export class CStartBar extends CWidget<StartBarState> {
  declare public props: CStartBarProps;
  declare public state: StartBarState;

  public constructor(props: CStartBarProps) {
    super(props);
    this.state = { ...this.state, resolvedHeight: props.height ?? props.defaultHeight };
  }

  public componentDidUpdate(prevProps: CStartBarProps): void {
    super.componentDidUpdate(prevProps);
    if (prevProps.height !== this.props.height) {
      this.setState((current) => ({
        ...current,
        resolvedHeight: this.props.height ?? current.resolvedHeight,
      }));
    }
  }

  public render(): React.ReactElement {
    const testId = this.props['data-testid'] ?? 'start-bar';
    return (
      <View testID={testId}>
        <Pressable testID={`${testId}-button`}>
          <Text>{this.props.startLabel ?? 'Start'}</Text>
        </Pressable>
        <View testID={`${testId}-content`}>{this.props.children}</View>
      </View>
    );
  }
}
