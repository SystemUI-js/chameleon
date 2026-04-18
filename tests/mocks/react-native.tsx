import React from 'react';

type BaseProps = {
  children?: React.ReactNode;
  style?: unknown;
  testID?: string;
  accessibilityLabel?: string;
};

type PressableProps = BaseProps & {
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
};

function toTestProps(props: BaseProps): Record<string, unknown> {
  return {
    'data-testid': props.testID,
    'aria-label': props.accessibilityLabel,
    style: props.style,
  };
}

export function View(props: BaseProps): React.ReactElement {
  return <div {...toTestProps(props)}>{props.children}</div>;
}

export function Text(props: BaseProps): React.ReactElement {
  return <span {...toTestProps(props)}>{props.children}</span>;
}

export function Pressable(props: PressableProps): React.ReactElement {
  return (
    <button
      type="button"
      {...toTestProps(props)}
      disabled={props.disabled}
      onMouseDown={props.onPressIn}
      onMouseUp={props.onPressOut}
      onClick={props.onPress}
    >
      {props.children}
    </button>
  );
}

export const StyleSheet = {
  create<T extends Record<string, unknown>>(styles: T): T {
    return styles;
  },
};
