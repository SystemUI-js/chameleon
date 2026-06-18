import type React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CListIconProps {
  visual: React.ReactNode;
  label: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  draggable?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLButtonElement>;
  onContextMenu?: React.MouseEventHandler<HTMLButtonElement>;
  onDragStart?: React.DragEventHandler<HTMLButtonElement>;
  onDrag?: React.DragEventHandler<HTMLButtonElement>;
  onDragEnd?: React.DragEventHandler<HTMLButtonElement>;
  className?: string;
  theme?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

export function CListIcon({
  visual,
  label,
  active,
  disabled,
  draggable,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDrag,
  onDragEnd,
  className,
  theme,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: CListIconProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const baseClasses = ['cm-list-icon'];

  if (active) {
    baseClasses.push('cm-list-icon--active');
  }

  if (disabled) {
    baseClasses.push('cm-list-icon--disabled');
  }

  if (draggable) {
    baseClasses.push('cm-list-icon--draggable');
  }

  return (
    <button
      type="button"
      data-testid={dataTestId}
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      disabled={disabled}
      draggable={draggable}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      aria-label={ariaLabel}
    >
      <span className="cm-list-icon__visual">{visual}</span>
      <span className="cm-list-icon__label">{label}</span>
    </button>
  );
}
