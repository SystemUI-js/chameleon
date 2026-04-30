import React from 'react';
import { Text } from '../runtime/react-native-web';

function isNativeTextNode(child: React.ReactNode): child is string | number {
  return typeof child === 'string' || typeof child === 'number';
}

function isReactFragment(
  child: React.ReactNode,
): child is React.ReactElement<{ children?: React.ReactNode }> {
  return (
    React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment
  );
}

export function renderNativeTextChildren(
  children: React.ReactNode,
  className?: string,
): React.ReactNode {
  if (isNativeTextNode(children)) {
    return <Text className={className}>{children}</Text>;
  }

  return React.Children.map(children, (child) => {
    if (isNativeTextNode(child)) {
      return <Text className={className}>{child}</Text>;
    }

    if (isReactFragment(child)) {
      return React.cloneElement(child, {
        children: renderNativeTextChildren(child.props.children, className),
      });
    }

    return child;
  });
}
