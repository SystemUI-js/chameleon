import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CListItemKey = string | number;
export type CListType = 'list' | 'grid' | 'icon';
export type CListItemDragPosition = 'before' | 'after' | 'inside';
export type CListItemDragInput = 'pointer' | 'keyboard';

export interface CListItemReference<T> {
  readonly item: T;
  readonly key: CListItemKey;
  readonly index: number;
}

export interface CListItemDragPayload<T> {
  readonly source: CListItemReference<T>;
  readonly target: CListItemReference<T>;
  readonly position: Exclude<CListItemDragPosition, 'inside'>;
  readonly input: CListItemDragInput;
}

export interface CListItemDragIntoPayload<T> {
  readonly source: CListItemReference<T>;
  readonly target: CListItemReference<T>;
  readonly position: Extract<CListItemDragPosition, 'inside'>;
  readonly input: CListItemDragInput;
}

export interface CListItemHoverPayload<T> extends CListItemReference<T> {
  readonly event: React.MouseEvent<HTMLLIElement>;
}

export interface CListItemDoubleClickPayload<T> extends CListItemReference<T> {
  readonly event: React.MouseEvent<HTMLLIElement>;
}

interface CListItemLoadState {
  readonly status: 'loading' | 'error';
  readonly message?: string;
}

interface CListInternalItemReference<T> {
  readonly publicReference: CListItemReference<T>;
  readonly path: readonly number[];
}

type CListStyle = React.CSSProperties & {
  readonly '--cm-list-icon-size'?: string;
};

export interface CListProps<T> {
  readonly items: readonly T[];
  readonly renderItem: (item: T, index: number) => React.ReactNode;
  readonly renderActions?: (item: T, index: number) => React.ReactNode;
  readonly getItemKey?: (item: T, index: number) => CListItemKey;
  readonly getItemChildren?: (item: T) => readonly T[] | undefined;
  readonly isItemExpandable?: (item: T) => boolean;
  readonly onLoadChildren?: (item: T, key: CListItemKey) => Promise<readonly T[]>;
  readonly onItemClick?: (
    item: T,
    index: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  readonly draggable?: boolean;
  readonly onItemDrag?: (payload: CListItemDragPayload<T>) => void;
  readonly onItemDragInto?: (payload: CListItemDragIntoPayload<T>) => void;
  readonly onItemHover?: (payload: CListItemHoverPayload<T>) => void;
  readonly onItemDoubleClick?: (payload: CListItemDoubleClickPayload<T>) => void;
  readonly emptyState?: React.ReactNode;
  readonly className?: string;
  readonly theme?: string;
  readonly style?: React.CSSProperties;
  readonly type?: CListType;
  readonly iconSize?: number | string;
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
  readonly 'data-testid'?: string;
}

const normalizeIconSize = (iconSize: number | string): string => {
  return typeof iconSize === 'number' ? `${iconSize}px` : iconSize;
};

const getListStyle = (
  style: React.CSSProperties | undefined,
  iconSize: number | string | undefined,
): CListStyle | undefined => {
  if (iconSize === undefined) {
    return style;
  }

  return {
    ...style,
    '--cm-list-icon-size': normalizeIconSize(iconSize),
  };
};

const getDropPosition = <T,>(
  event: React.DragEvent<HTMLLIElement>,
  target: CListItemReference<T>,
): CListItemDragPosition => {
  const rect = event.currentTarget.getBoundingClientRect();
  const pointerY = event.clientY;

  if (rect.height > 0 && pointerY > 0) {
    const offset = pointerY - rect.top;

    if (offset < rect.height / 3) {
      return 'before';
    }

    if (offset > (rect.height * 2) / 3) {
      return 'after';
    }

    return 'inside';
  }

  return target.index === 0 ? 'before' : 'after';
};

const getFallbackKey = (path: readonly number[]): string => path.join('.') || '0';

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Failed to load children.';
};

const isDescendantPath = (
  sourcePath: readonly number[],
  targetPath: readonly number[],
): boolean => {
  return (
    sourcePath.length < targetPath.length &&
    sourcePath.every((pathPart, index) => targetPath[index] === pathPart)
  );
};

export function CList<T>({
  items,
  renderItem,
  renderActions,
  getItemKey,
  getItemChildren,
  isItemExpandable,
  onLoadChildren,
  onItemClick,
  draggable = false,
  onItemDrag,
  onItemDragInto,
  onItemHover,
  onItemDoubleClick,
  emptyState,
  className,
  theme,
  style,
  type = 'list',
  iconSize,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'data-testid': dataTestId,
}: CListProps<T>): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const modeClassName = `cm-list--${type}`;
  const mergedStyle = getListStyle(style, iconSize);
  const dragSourceRef = useRef<CListInternalItemReference<T> | null>(null);
  const dropPositionRef = useRef<CListItemDragPosition | null>(null);
  const mountedRef = useRef(true);
  const requestTokenByKeyRef = useRef(new Map<CListItemKey, number>());
  const [activeDragKey, setActiveDragKey] = useState<CListItemKey | null>(null);
  const [dropTargetKey, setDropTargetKey] = useState<CListItemKey | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<ReadonlySet<CListItemKey>>(() => new Set());
  const [loadedChildrenByKey, setLoadedChildrenByKey] = useState<
    ReadonlyMap<CListItemKey, readonly T[]>
  >(() => new Map());
  const [loadStateByKey, setLoadStateByKey] = useState<
    ReadonlyMap<CListItemKey, CListItemLoadState>
  >(() => new Map());

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const buildItemReference = (
    item: T,
    index: number,
    key: CListItemKey,
  ): CListItemReference<T> => ({
    item,
    key,
    index,
  });

  const buildInternalItemReference = (
    item: T,
    index: number,
    key: CListItemKey,
    path: readonly number[],
  ): CListInternalItemReference<T> => ({
    publicReference: buildItemReference(item, index, key),
    path,
  });

  const getKey = (item: T, index: number, path: readonly number[]): CListItemKey => {
    return getItemKey ? getItemKey(item, index) : getFallbackKey(path);
  };

  const setLoadState = (key: CListItemKey, state: CListItemLoadState | null): void => {
    setLoadStateByKey((current) => {
      const next = new Map(current);

      if (state === null) {
        next.delete(key);
      } else {
        next.set(key, state);
      }

      return next;
    });
  };

  const emitMovementIntent = (
    source: CListInternalItemReference<T>,
    target: CListInternalItemReference<T>,
    position: CListItemDragPosition,
    input: CListItemDragInput,
  ): void => {
    if (
      source.publicReference.key === target.publicReference.key ||
      isDescendantPath(source.path, target.path)
    ) {
      return;
    }

    if (position === 'inside') {
      onItemDragInto?.({
        source: source.publicReference,
        target: target.publicReference,
        position,
        input,
      });
      return;
    }

    onItemDrag?.({
      source: source.publicReference,
      target: target.publicReference,
      position,
      input,
    });
  };

  const startChildLoad = (item: T, key: CListItemKey): void => {
    if (onLoadChildren === undefined) {
      return;
    }

    if (loadedChildrenByKey.has(key) || loadStateByKey.get(key)?.status === 'loading') {
      return;
    }

    const requestToken = (requestTokenByKeyRef.current.get(key) ?? 0) + 1;
    requestTokenByKeyRef.current.set(key, requestToken);
    setLoadState(key, { status: 'loading' });

    onLoadChildren(item, key)
      .then((children) => {
        if (!mountedRef.current || requestTokenByKeyRef.current.get(key) !== requestToken) {
          return;
        }

        setLoadedChildrenByKey((current) => {
          const next = new Map(current);
          next.set(key, children);
          return next;
        });
        setLoadState(key, null);
      })
      .catch((error: unknown) => {
        if (!mountedRef.current || requestTokenByKeyRef.current.get(key) !== requestToken) {
          return;
        }

        setLoadState(key, { status: 'error', message: getErrorMessage(error) });
      });
  };

  const setKeyExpanded = (key: CListItemKey, expanded: boolean): void => {
    setExpandedKeys((current) => {
      if (expanded === current.has(key)) {
        return current;
      }

      const next = new Set(current);

      if (expanded) {
        next.add(key);
      } else {
        next.delete(key);
      }

      return next;
    });
  };

  const handleExpandToggle = (item: T, key: CListItemKey): void => {
    if (expandedKeys.has(key)) {
      setKeyExpanded(key, false);
      return;
    }

    setKeyExpanded(key, true);

    const immediateChildren = getItemChildren?.(item);
    const expandable = isItemExpandable?.(item) ?? immediateChildren !== undefined;

    if (!expandable || immediateChildren !== undefined || loadedChildrenByKey.has(key)) {
      return;
    }

    startChildLoad(item, key);
  };

  const retryChildLoad = (item: T, key: CListItemKey): void => {
    setLoadState(key, null);
    startChildLoad(item, key);
  };

  const renderItemTree = (
    treeItems: readonly T[],
    path: readonly number[],
    isRootLevel: boolean,
  ): React.ReactElement => {
    const treeClassName = isRootLevel
      ? mergeClasses(['cm-list', modeClassName], resolvedTheme, className)
      : `cm-list__children cm-list__children--${type}`;

    return (
      <ul
        className={treeClassName}
        style={isRootLevel ? mergedStyle : undefined}
        aria-label={isRootLevel ? ariaLabel : undefined}
        aria-labelledby={isRootLevel ? ariaLabelledBy : undefined}
        data-testid={isRootLevel ? dataTestId : undefined}
      >
        {treeItems.map((item, index) => {
          const itemPath = [...path, index];
          const key = getKey(item, index, itemPath);
          const actionsNode = renderActions?.(item, index);
          const itemReference = buildItemReference(item, index, key);
          const internalItemReference = buildInternalItemReference(item, index, key, itemPath);
          const immediateChildren = getItemChildren?.(item);
          const loadedChildren = loadedChildrenByKey.get(key);
          const loadState = loadStateByKey.get(key);
          const isExpanded = expandedKeys.has(key);
          const isExpandable = isItemExpandable?.(item) ?? immediateChildren !== undefined;
          const childItems = immediateChildren ?? loadedChildren;
          const itemClasses = ['cm-list__item', `cm-list__item--${type}`];

          if (draggable) {
            itemClasses.push('cm-list__item--draggable');
          }

          if (activeDragKey === key) {
            itemClasses.push('cm-list__item--dragging');
          }

          if (dropTargetKey === key) {
            itemClasses.push('cm-list__item--drop-target');
          }

          const itemClassName = mergeClasses(itemClasses);
          const rowClassName = `cm-list__item-row cm-list__item-row--${type}`;
          const dragHandleClassName = `cm-list__drag-handle cm-list__drag-handle--${type}`;
          const actionClassName = `cm-list__item-action cm-list__item-action--${type}`;
          const contentClassName = `cm-list__item-content cm-list__item-content--${type}`;
          const actionsClassName = `cm-list__item-actions cm-list__item-actions--${type}`;
          const expandToggleClassName = `cm-list__expand-toggle cm-list__expand-toggle--${type}`;
          const loadStateClassName = `cm-list__load-state cm-list__load-state--${type}`;
          const nextItem = treeItems[index + 1];
          const previousItem = treeItems[index - 1];

          return (
            <li
              key={key}
              className={itemClassName}
              draggable={draggable}
              onDragStart={(event) => {
                if (!draggable) {
                  return;
                }

                dragSourceRef.current = internalItemReference;
                dropPositionRef.current = null;
                setActiveDragKey(key);
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', String(key));
              }}
              onDragOver={(event) => {
                if (!draggable || dragSourceRef.current === null) {
                  return;
                }

                event.preventDefault();
                dropPositionRef.current =
                  event.altKey || event.dataTransfer.dropEffect === 'copy'
                    ? 'inside'
                    : getDropPosition(event, itemReference);
                event.dataTransfer.dropEffect = 'move';
                setDropTargetKey(key);
              }}
              onDragLeave={() => {
                if (dropTargetKey === key) {
                  setDropTargetKey(null);
                }
              }}
              onDrop={(event) => {
                if (!draggable || dragSourceRef.current === null) {
                  return;
                }

                event.preventDefault();
                const position =
                  dropPositionRef.current ??
                  (event.altKey ? 'inside' : getDropPosition(event, itemReference));
                emitMovementIntent(
                  dragSourceRef.current,
                  internalItemReference,
                  position,
                  'pointer',
                );
                dragSourceRef.current = null;
                dropPositionRef.current = null;
                setActiveDragKey(null);
                setDropTargetKey(null);
              }}
              onDragEnd={() => {
                dragSourceRef.current = null;
                dropPositionRef.current = null;
                setActiveDragKey(null);
                setDropTargetKey(null);
              }}
              onMouseEnter={(event) => onItemHover?.({ ...itemReference, event })}
              onDoubleClick={(event) => onItemDoubleClick?.({ ...itemReference, event })}
            >
              <div className={rowClassName}>
                {isExpandable && (
                  <button
                    type="button"
                    className={expandToggleClassName}
                    aria-label={
                      isExpanded ? `Collapse item ${index + 1}` : `Expand item ${index + 1}`
                    }
                    aria-expanded={isExpanded}
                    title={isExpanded ? 'Collapse item' : 'Expand item'}
                    onClick={() => handleExpandToggle(item, key)}
                  >
                    {isExpanded ? '▾' : '▸'}
                  </button>
                )}
                {draggable && (
                  <button
                    type="button"
                    className={dragHandleClassName}
                    aria-label={`Move item ${index + 1}`}
                    title="Move item"
                    onKeyDown={(event) => {
                      if (event.altKey && event.key === 'ArrowRight' && nextItem !== undefined) {
                        event.preventDefault();
                        emitMovementIntent(
                          internalItemReference,
                          buildInternalItemReference(
                            nextItem,
                            index + 1,
                            getKey(nextItem, index + 1, [...path, index + 1]),
                            [...path, index + 1],
                          ),
                          'inside',
                          'keyboard',
                        );
                        return;
                      }

                      if (event.key === 'ArrowUp' && previousItem !== undefined) {
                        event.preventDefault();
                        emitMovementIntent(
                          internalItemReference,
                          buildInternalItemReference(
                            previousItem,
                            index - 1,
                            getKey(previousItem, index - 1, [...path, index - 1]),
                            [...path, index - 1],
                          ),
                          'before',
                          'keyboard',
                        );
                        return;
                      }

                      if (event.key === 'ArrowDown' && nextItem !== undefined) {
                        event.preventDefault();
                        emitMovementIntent(
                          internalItemReference,
                          buildInternalItemReference(
                            nextItem,
                            index + 1,
                            getKey(nextItem, index + 1, [...path, index + 1]),
                            [...path, index + 1],
                          ),
                          'after',
                          'keyboard',
                        );
                      }
                    }}
                  >
                    ↕
                  </button>
                )}
                {onItemClick ? (
                  <button
                    type="button"
                    className={actionClassName}
                    onClick={(event) => onItemClick(item, index, event)}
                  >
                    <div className={contentClassName}>{renderItem(item, index)}</div>
                  </button>
                ) : (
                  <div className={contentClassName}>{renderItem(item, index)}</div>
                )}
                {actionsNode != null && <div className={actionsClassName}>{actionsNode}</div>}
              </div>
              {isExpanded && (childItems !== undefined || loadState !== undefined) && (
                <div className={`cm-list__children-frame cm-list__children-frame--${type}`}>
                  {loadState?.status === 'loading' && (
                    <div className={loadStateClassName} role="status" aria-live="polite">
                      Loading children…
                    </div>
                  )}
                  {loadState?.status === 'error' && (
                    <div className={loadStateClassName} role="alert">
                      <span>{loadState.message ?? 'Failed to load children.'}</span>
                      <button
                        type="button"
                        className="cm-list__load-retry"
                        onClick={() => retryChildLoad(item, key)}
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  {childItems !== undefined &&
                    childItems.length > 0 &&
                    renderItemTree(childItems, itemPath, false)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  if (items.length === 0 && emptyState) {
    return (
      <div
        className={mergeClasses(
          ['cm-list', modeClassName, 'cm-list--empty'],
          resolvedTheme,
          className,
        )}
        style={mergedStyle}
        data-testid={dataTestId}
      >
        {emptyState}
      </div>
    );
  }

  return renderItemTree(items, [], true);
}
