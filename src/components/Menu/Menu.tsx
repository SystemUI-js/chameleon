import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CMenuTrigger = React.ReactElement;

export interface MenuListItem {
  id: string;
  key: string;
  title: string;
  children?: readonly MenuListItem[];
  trigger?: 'click' | 'hover';
  disabled?: boolean;
}

export interface CMenuProps {
  children: CMenuTrigger;
  menuList: readonly MenuListItem[];
  trigger?: 'click' | 'hover';
  onSelect?: (item: MenuListItem) => void;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

interface TriggerElementProps {
  onClick?: React.MouseEventHandler<Element>;
  onPointerEnter?: React.PointerEventHandler<Element>;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: React.AriaAttributes['aria-haspopup'];
}

type MenuTriggerMode = 'click' | 'hover';

const DEFAULT_TRIGGER_MODE: MenuTriggerMode = 'click';

function resolveThemeClass(theme: string | undefined): string | undefined {
  if (theme === undefined) {
    return undefined;
  }
  return theme.startsWith('cm-theme--') ? theme : `cm-theme--${theme}`;
}

export function CMenu({
  children,
  menuList,
  trigger,
  onSelect,
  className,
  theme,
  'data-testid': dataTestId,
}: CMenuProps): React.ReactElement {
  const resolvedTheme = resolveThemeClass(useTheme(theme));
  const baseClasses = ['cm-menu'];
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [isRootOpen, setIsRootOpen] = React.useState(false);
  const [openBranchByDepth, setOpenBranchByDepth] = React.useState<string[]>([]);
  const rootTriggerMode = trigger ?? DEFAULT_TRIGGER_MODE;

  React.Children.only(children);

  const closeAllMenus = React.useCallback(() => {
    setIsRootOpen(false);
    setOpenBranchByDepth([]);
  }, []);

  const openBranchAtDepth = React.useCallback((depth: number, id: string) => {
    setOpenBranchByDepth((previous) => {
      const next = previous.slice(0, depth);
      next[depth] = id;
      return next;
    });
  }, []);

  const toggleBranchAtDepth = React.useCallback((depth: number, id: string) => {
    setOpenBranchByDepth((previous) => {
      if (previous[depth] === id) {
        return previous.slice(0, depth);
      }

      const next = previous.slice(0, depth);
      next[depth] = id;
      return next;
    });
  }, []);

  React.useEffect(() => {
    const handleDocumentMouseDown = (event: MouseEvent): void => {
      if (!isRootOpen) {
        return;
      }

      if (!(event.target instanceof Node)) {
        return;
      }

      if (rootRef.current !== null && !rootRef.current.contains(event.target)) {
        closeAllMenus();
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [closeAllMenus, isRootOpen]);

  const handleRootTriggerClick: React.MouseEventHandler<Element> = (event) => {
    const triggerProps = children.props as TriggerElementProps;
    triggerProps.onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (rootTriggerMode === 'click') {
      setIsRootOpen((previous) => !previous);
      setOpenBranchByDepth([]);
    }
  };

  const handleRootTriggerPointerEnter: React.PointerEventHandler<Element> = (event) => {
    const triggerProps = children.props as TriggerElementProps;
    triggerProps.onPointerEnter?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (rootTriggerMode === 'hover') {
      setIsRootOpen(true);
    }
  };

  const handleRootPointerLeave: React.PointerEventHandler<HTMLDivElement> = () => {
    if (rootTriggerMode === 'hover') {
      closeAllMenus();
    }
  };

  const renderItems = (
    items: readonly MenuListItem[],
    depth: number,
    parentTrigger: MenuTriggerMode,
  ): React.ReactElement => {
    return (
      <ul className="cm-menu__list" data-testid="cm-menu-list" data-menu-depth={depth}>
        {items.map((item) => {
          const isParent = Array.isArray(item.children) && item.children.length > 0;
          const effectiveTrigger = item.trigger ?? parentTrigger;
          const isBranchOpen = openBranchByDepth[depth] === item.id;

          const handleParentClick = (): void => {
            if (item.disabled || effectiveTrigger !== 'click') {
              return;
            }

            toggleBranchAtDepth(depth, item.id);
          };

          const handleParentPointerEnter = (): void => {
            if (item.disabled || effectiveTrigger !== 'hover') {
              return;
            }

            openBranchAtDepth(depth, item.id);
          };

          const handleLeafClick = (): void => {
            if (item.disabled) {
              return;
            }

            onSelect?.(item);
            closeAllMenus();
          };

          return (
            <li
              key={item.id}
              className={mergeClasses(
                [
                  'cm-menu__item',
                  item.disabled ? 'cm-menu__item--disabled' : undefined,
                  isBranchOpen ? 'cm-menu__item--open' : undefined,
                ].filter((c): c is string => c !== undefined),
              )}
            >
              <button
                type="button"
                className={mergeClasses(
                  [
                    'cm-menu__item-button',
                    isParent ? 'cm-menu__item-button--parent' : 'cm-menu__item-button--leaf',
                  ],
                  item.disabled ? 'cm-menu__item-button--disabled' : undefined,
                )}
                data-testid={`menu-item-${item.id}`}
                data-menu-item-id={item.id}
                data-menu-item-key={item.key}
                data-menu-item-type={isParent ? 'parent' : 'leaf'}
                disabled={item.disabled}
                onClick={isParent ? handleParentClick : handleLeafClick}
                onPointerEnter={isParent ? handleParentPointerEnter : undefined}
              >
                {item.title}
                {isParent && <span className="cm-menu__caret">▸</span>}
              </button>
              {isParent && isBranchOpen ? (
                <div className="cm-menu__submenu">
                  {renderItems(item.children ?? [], depth + 1, effectiveTrigger)}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  };

  const triggerElement = React.cloneElement(children as React.ReactElement<TriggerElementProps>, {
    'aria-expanded': isRootOpen,
    'aria-haspopup': 'menu',
    onClick: handleRootTriggerClick,
    onPointerEnter: handleRootTriggerPointerEnter,
  });

  return (
    <div
      ref={rootRef}
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      data-testid={dataTestId}
      data-menu-state={isRootOpen ? 'open' : 'closed'}
      onPointerLeave={handleRootPointerLeave}
    >
      <div className="cm-menu__trigger">{triggerElement}</div>
      {isRootOpen ? (
        <div className="cm-menu__popup" data-testid="menu-demo-popup">
          {renderItems(menuList, 0, rootTriggerMode)}
        </div>
      ) : null}
    </div>
  );
}
