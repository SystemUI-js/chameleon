import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CStatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: string;
}

export function CStatusBar({
  children,
  className,
  theme,
  ...restProps
}: CStatusBarProps): React.ReactElement {
  const resolvedTheme = useTheme(theme);

  return (
    <div {...restProps} className={mergeClasses(['cm-status-bar'], resolvedTheme, className)}>
      {children}
    </div>
  );
}
