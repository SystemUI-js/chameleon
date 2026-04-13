import type React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CStatusBarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: string;
}

export function CStatusBarItem({
  children,
  className,
  theme,
  ...restProps
}: CStatusBarItemProps): React.ReactElement {
  const resolvedTheme = useTheme(theme);

  return (
    <div {...restProps} className={mergeClasses(['cm-status-bar__item'], resolvedTheme, className)}>
      {children}
    </div>
  );
}
