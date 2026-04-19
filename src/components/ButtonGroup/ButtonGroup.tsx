import React from 'react';
import { View } from 'react-native';
import { CButton, type CButtonProps, type CButtonVariant } from '../Button/Button';
import {
  CButtonSeparator,
  type CButtonSeparatorProps,
  type CButtonSeparatorOrientation,
} from '../ButtonSeparator/ButtonSeparator';
import { mergeClasses } from '../Theme/mergeClasses';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CButtonGroupOrientation = 'horizontal' | 'vertical';

export interface CButtonGroupProps {
  children?: React.ReactNode;
  orientation?: CButtonGroupOrientation;
  variant?: CButtonVariant;
  disabled?: boolean;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

type GroupedButtonElement = React.ReactElement<CButtonProps, typeof CButton>;
type GroupedSeparatorElement = React.ReactElement<CButtonSeparatorProps, typeof CButtonSeparator>;
type GroupPosition = 'first' | 'middle' | 'last' | 'single';

function resolveThemeClass(theme: string | undefined): string | undefined {
  if (theme === undefined) {
    return undefined;
  }

  return theme.startsWith('cm-theme--') ? theme : `cm-theme--${theme}`;
}

function flattenGroupChildren(children: React.ReactNode): React.ReactNode[] {
  const flattened: React.ReactNode[] = [];

  React.Children.toArray(children).forEach((child) => {
    if (typeof child === 'boolean') {
      return;
    }

    if (React.isValidElement(child) && child.type === React.Fragment) {
      flattened.push(...flattenGroupChildren(child.props.children));
      return;
    }

    flattened.push(child);
  });

  return flattened;
}

function normalizeOptionalTheme(theme: string | undefined): string | undefined {
  if (theme === undefined) {
    return undefined;
  }

  const normalizedTheme = theme.trim();

  return normalizedTheme.length > 0 ? normalizedTheme : undefined;
}

function isButtonElement(child: React.ReactNode): child is GroupedButtonElement {
  return React.isValidElement(child) && child.type === CButton;
}

function isSeparatorElement(child: React.ReactNode): child is GroupedSeparatorElement {
  return React.isValidElement(child) && child.type === CButtonSeparator;
}

function resolvePosition(index: number, total: number): GroupPosition {
  if (total === 1) {
    return 'single';
  }

  if (index === 0) {
    return 'first';
  }

  if (index === total - 1) {
    return 'last';
  }

  return 'middle';
}

function resolveSeparatorOrientation(
  orientation: CButtonGroupOrientation,
): CButtonSeparatorOrientation {
  return orientation === 'horizontal' ? 'vertical' : 'horizontal';
}

export function CButtonGroup({
  children,
  orientation = 'horizontal',
  variant,
  disabled = false,
  className,
  theme,
  'data-testid': dataTestId,
}: CButtonGroupProps): React.ReactElement {
  const inheritedTheme = useTheme(theme);
  const resolvedTheme = resolveThemeClass(inheritedTheme);
  const flattenedChildren = flattenGroupChildren(children);
  const renderedChildren: React.ReactNode[] = [];
  let currentSegment: GroupedButtonElement[] = [];

  const flushSegment = (): void => {
    if (currentSegment.length === 0) {
      return;
    }

    currentSegment.forEach((child, index) => {
      const position = resolvePosition(index, currentSegment.length);
      const groupedClassName = mergeClasses(
        ['cm-button--grouped', `cm-button--group-${position}`, `cm-button--group-${orientation}`],
        undefined,
        child.props.className,
      );
      const nextProps: Partial<CButtonProps> = {
        className: groupedClassName,
        disabled: disabled || child.props.disabled,
        variant: child.props.variant ?? variant,
      };

      if (normalizeOptionalTheme(child.props.theme) === undefined && inheritedTheme !== undefined) {
        nextProps.theme = inheritedTheme;
      }

      renderedChildren.push(React.cloneElement(child, nextProps));
    });

    currentSegment = [];
  };

  flattenedChildren.forEach((child) => {
    if (isButtonElement(child)) {
      currentSegment.push(child);
      return;
    }

    flushSegment();

    if (isSeparatorElement(child)) {
      const nextProps: Partial<CButtonSeparatorProps> = {
        orientation: child.props.orientation ?? resolveSeparatorOrientation(orientation),
      };

      if (normalizeOptionalTheme(child.props.theme) === undefined && inheritedTheme !== undefined) {
        nextProps.theme = inheritedTheme;
      }

      renderedChildren.push(React.cloneElement(child, nextProps));
      return;
    }

    renderedChildren.push(child);
  });

  flushSegment();

  const baseClasses = ['cm-button-group', `cm-button-group--${orientation}`];

  return (
    <View className={mergeClasses(baseClasses, resolvedTheme, className)} testID={dataTestId}>
      {renderedChildren}
    </View>
  );
}
