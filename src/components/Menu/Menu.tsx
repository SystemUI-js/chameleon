import React from 'react';
import { Pressable, Text, View } from 'react-native';
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
  'aria-controls'?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: React.AriaAttributes['aria-haspopup'];
}

type MenuTriggerMode = 'click' | 'hover';

const DEFAULT_ROOT_TRIGGER_MODE: MenuTriggerMode = 'click';
const DEFAULT_SUBMENU_TRIGGER_MODE: MenuTriggerMode = 'hover';

function resolveRootTriggerMode(trigger: MenuTriggerMode | undefined): MenuTriggerMode {
  return trigger ?? DEFAULT_ROOT_TRIGGER_MODE;
}

function resolveParentItemTriggerMode(itemTrigger: MenuTriggerMode | undefined): MenuTriggerMode {
  return itemTrigger ?? DEFAULT_SUBMENU_TRIGGER_MODE;
}

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
  const menuInstanceId = React.useId().replace(/:/g, '');
  const rootMenuId = `${menuInstanceId}-menu`;
  const rootRef = React.useRef<HTMLElement | null>(null);
  const [isRootOpen, setIsRootOpen] = React.useState(false);
  const [openBranchByDepth, setOpenBranchByDepth] = React.useState<string[]>([]);
  const rootTriggerMode = resolveRootTriggerMode(trigger);

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

    setIsRootOpen((previous) => !previous);
    setOpenBranchByDepth([]);
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

  const handleRootPointerLeave: React.PointerEventHandler<HTMLElement> = () => {
    if (rootTriggerMode === 'hover') {
      closeAllMenus();
    }
  };

  const renderItems = (
    items: readonly MenuListItem[],
    depth: number,
    listId: string,
    parentPath = '',
    parentTrigger?: MenuTriggerMode,
  ): React.ReactElement => {
    const menuRole: React.AriaRole = 'menu';

    return (
      <View
        id={listId}
        role={menuRole}
        testID="cm-menu-list"
        className="cm-menu__list"
        data-menu-depth={depth}
      >
        {items.map((item) => {
          const isParent = Array.isArray(item.children) && item.children.length > 0;
          const effectiveTrigger = isParent
            ? resolveParentItemTriggerMode(item.trigger ?? parentTrigger)
            : undefined;
          const isBranchOpen = openBranchByDepth[depth] === item.id;
          const itemPath = parentPath === '' ? item.id : `${parentPath}-${item.id}`;
          const submenuId = `${menuInstanceId}-${itemPath}-submenu`;

          const handleParentClick = (): void => {
            if (item.disabled) {
              return;
            }

            if (effectiveTrigger === 'hover') {
              if (!isBranchOpen) {
                openBranchAtDepth(depth, item.id);
              }

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
            <View
              key={item.id}
              role="none"
              className={mergeClasses(
                [
                  'cm-menu__item',
                  item.disabled ? 'cm-menu__item--disabled' : undefined,
                  isBranchOpen ? 'cm-menu__item--open' : undefined,
                ].filter((c): c is string => c !== undefined),
              )}
            >
              <Pressable
                role="menuitem"
                testID={`menu-item-${item.id}`}
                className={mergeClasses(
                  [
                    'cm-menu__item-button',
                    isParent ? 'cm-menu__item-button--parent' : 'cm-menu__item-button--leaf',
                  ],
                  item.disabled ? 'cm-menu__item-button--disabled' : undefined,
                )}
                data-menu-item-id={item.id}
                data-menu-item-key={item.key}
                data-menu-item-type={isParent ? 'parent' : 'leaf'}
                disabled={item.disabled}
                aria-haspopup={isParent ? 'menu' : undefined}
                aria-expanded={isParent ? isBranchOpen : undefined}
                aria-controls={isParent ? submenuId : undefined}
                onClick={isParent ? handleParentClick : handleLeafClick}
                onPointerEnter={isParent ? handleParentPointerEnter : undefined}
              >
                <Text>{item.title}</Text>
                {isParent && <Text className="cm-menu__caret">▸</Text>}
              </Pressable>
              {isParent && isBranchOpen ? (
                <View className="cm-menu__popup cm-menu__submenu">
                  {renderItems(
                    item.children ?? [],
                    depth + 1,
                    submenuId,
                    itemPath,
                    effectiveTrigger,
                  )}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    );
  };

  const triggerElement = React.cloneElement(children as React.ReactElement<TriggerElementProps>, {
    'aria-controls': isRootOpen ? rootMenuId : undefined,
    'aria-expanded': isRootOpen,
    'aria-haspopup': 'menu',
    onClick: handleRootTriggerClick,
    onPointerEnter: handleRootTriggerPointerEnter,
  });

  return (
    <View
      ref={rootRef}
      className={mergeClasses(baseClasses, resolvedTheme, className)}
      testID={dataTestId}
      data-menu-state={isRootOpen ? 'open' : 'closed'}
      onPointerLeave={handleRootPointerLeave}
    >
      {triggerElement}
      {isRootOpen ? (
        <View className="cm-menu__popup" testID="menu-demo-popup">
          {renderItems(menuList, 0, rootMenuId)}
        </View>
      ) : null}
    </View>
  );
}
