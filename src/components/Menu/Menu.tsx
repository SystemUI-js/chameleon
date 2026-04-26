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

const MENU_BACKDROP_TEST_ID = 'cm-menu-backdrop';

interface TriggerElementProps {
  onClick?: React.MouseEventHandler<Element>;
  onPointerEnter?: React.PointerEventHandler<Element>;
  onBlur?: React.FocusEventHandler<Element>;
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

function hasChildMenuItems(
  item: MenuListItem,
): item is MenuListItem & { children: readonly MenuListItem[] } {
  return Array.isArray(item.children) && item.children.length > 0;
}

function resolveMenuItemPath(parentPath: string, itemId: string): string {
  return parentPath === '' ? itemId : `${parentPath}-${itemId}`;
}

function resolveMenuItemType(isParent: boolean): 'parent' | 'leaf' {
  return isParent ? 'parent' : 'leaf';
}

function resolveMenuItemButtonTypeClass(isParent: boolean): string {
  return isParent ? 'cm-menu__item-button--parent' : 'cm-menu__item-button--leaf';
}

function resolveMenuItemClassName(disabled: boolean | undefined, isBranchOpen: boolean): string {
  return mergeClasses(
    [
      'cm-menu__item',
      disabled ? 'cm-menu__item--disabled' : undefined,
      isBranchOpen ? 'cm-menu__item--open' : undefined,
    ].filter((className): className is string => className !== undefined),
  );
}

function resolveMenuItemButtonClassName(disabled: boolean | undefined, isParent: boolean): string {
  return mergeClasses(
    ['cm-menu__item-button', resolveMenuItemButtonTypeClass(isParent)],
    disabled ? 'cm-menu__item-button--disabled' : undefined,
  );
}

function createMenuItemClickHandler({
  isParent,
  item,
  effectiveTrigger,
  isBranchOpen,
  depth,
  onParentClick,
  onLeafClick,
}: {
  isParent: boolean;
  item: MenuListItem;
  effectiveTrigger?: MenuTriggerMode;
  isBranchOpen: boolean;
  depth: number;
  onParentClick: (params: {
    disabled?: boolean;
    effectiveTrigger?: MenuTriggerMode;
    isBranchOpen: boolean;
    depth: number;
    itemId: string;
  }) => void;
  onLeafClick: (params: { item: MenuListItem; disabled?: boolean }) => void;
}): () => void {
  if (isParent) {
    return (): void => {
      onParentClick({
        disabled: item.disabled,
        effectiveTrigger,
        isBranchOpen,
        depth,
        itemId: item.id,
      });
    };
  }

  return (): void => {
    onLeafClick({
      item,
      disabled: item.disabled,
    });
  };
}

function createMenuItemPointerEnterHandler({
  isParent,
  item,
  effectiveTrigger,
  depth,
  onParentPointerEnter,
}: {
  isParent: boolean;
  item: MenuListItem;
  effectiveTrigger?: MenuTriggerMode;
  depth: number;
  onParentPointerEnter: (params: {
    disabled?: boolean;
    effectiveTrigger?: MenuTriggerMode;
    depth: number;
    itemId: string;
  }) => void;
}): (() => void) | undefined {
  if (!isParent) {
    return undefined;
  }

  return (): void => {
    onParentPointerEnter({
      disabled: item.disabled,
      effectiveTrigger,
      depth,
      itemId: item.id,
    });
  };
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
  const [isRootOpen, setIsRootOpen] = React.useState(false);
  const [openBranchByDepth, setOpenBranchByDepth] = React.useState<string[]>([]);
  const rootTriggerMode = resolveRootTriggerMode(trigger);
  const shouldRenderBackdrop = isRootOpen && rootTriggerMode === 'click';

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

  const handleRootPointerLeave: React.PointerEventHandler<HTMLDivElement> = () => {
    if (rootTriggerMode === 'hover') {
      closeAllMenus();
    }
  };

  const handleRootBlur: React.FocusEventHandler<HTMLElement> = (event) => {
    if (!isRootOpen) {
      return;
    }

    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    closeAllMenus();
  };

  const handleParentItemClick = React.useCallback(
    ({
      disabled,
      effectiveTrigger,
      isBranchOpen,
      depth,
      itemId,
    }: {
      disabled?: boolean;
      effectiveTrigger?: MenuTriggerMode;
      isBranchOpen: boolean;
      depth: number;
      itemId: string;
    }): void => {
      if (disabled) {
        return;
      }

      if (effectiveTrigger === 'hover') {
        if (!isBranchOpen) {
          openBranchAtDepth(depth, itemId);
        }

        return;
      }

      toggleBranchAtDepth(depth, itemId);
    },
    [openBranchAtDepth, toggleBranchAtDepth],
  );

  const handleParentItemPointerEnter = React.useCallback(
    ({
      disabled,
      effectiveTrigger,
      depth,
      itemId,
    }: {
      disabled?: boolean;
      effectiveTrigger?: MenuTriggerMode;
      depth: number;
      itemId: string;
    }): void => {
      if (disabled || effectiveTrigger !== 'hover') {
        return;
      }

      openBranchAtDepth(depth, itemId);
    },
    [openBranchAtDepth],
  );

  const handleLeafItemClick = React.useCallback(
    ({ item, disabled }: { item: MenuListItem; disabled?: boolean }): void => {
      if (disabled) {
        return;
      }

      onSelect?.(item);
      closeAllMenus();
    },
    [closeAllMenus, onSelect],
  );

  const renderMenuItem = (
    item: MenuListItem,
    depth: number,
    parentPath: string,
    parentTrigger?: MenuTriggerMode,
  ): React.ReactElement => {
    const isParent = hasChildMenuItems(item);
    const effectiveTrigger = isParent
      ? resolveParentItemTriggerMode(item.trigger ?? parentTrigger)
      : undefined;
    const isBranchOpen = openBranchByDepth[depth] === item.id;
    const itemPath = resolveMenuItemPath(parentPath, item.id);
    const submenuId = `${menuInstanceId}-${itemPath}-submenu`;
    const itemType = resolveMenuItemType(isParent);
    const itemClassName = resolveMenuItemClassName(item.disabled, isBranchOpen);
    const buttonClassName = resolveMenuItemButtonClassName(item.disabled, isParent);
    const handleClick = createMenuItemClickHandler({
      isParent,
      item,
      effectiveTrigger,
      isBranchOpen,
      depth,
      onParentClick: handleParentItemClick,
      onLeafClick: handleLeafItemClick,
    });
    const handlePointerEnter = createMenuItemPointerEnterHandler({
      isParent,
      item,
      effectiveTrigger,
      depth,
      onParentPointerEnter: handleParentItemPointerEnter,
    });
    const submenu =
      isParent && isBranchOpen ? (
        <View className="cm-menu__popup cm-menu__submenu">
          {renderItems(item.children, depth + 1, submenuId, itemPath, effectiveTrigger)}
        </View>
      ) : null;

    return (
      <View key={item.id} role="none" className={itemClassName}>
        <Pressable
          role="menuitem"
          className={buttonClassName}
          testID={`menu-item-${item.id}`}
          data-menu-item-id={item.id}
          data-menu-item-key={item.key}
          data-menu-item-type={itemType}
          disabled={item.disabled}
          aria-haspopup={isParent ? 'menu' : undefined}
          aria-expanded={isParent ? isBranchOpen : undefined}
          aria-controls={isParent ? submenuId : undefined}
          onClick={handleClick}
          onPointerEnter={handlePointerEnter}
        >
          <Text>{item.title}</Text>
          {isParent ? <Text className="cm-menu__caret">▸</Text> : null}
        </Pressable>
        {submenu}
      </View>
    );
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
        className="cm-menu__list"
        testID="cm-menu-list"
        data-menu-depth={depth}
      >
        {items.map((item) => renderMenuItem(item, depth, parentPath, parentTrigger))}
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
    <>
      {shouldRenderBackdrop ? (
        <Pressable
          className="cm-menu__backdrop"
          data-testid={MENU_BACKDROP_TEST_ID}
          testID={MENU_BACKDROP_TEST_ID}
          onClick={closeAllMenus}
          onPress={closeAllMenus}
        >
          <View className="cm-menu__backdrop-fill" />
        </Pressable>
      ) : null}
      <View
        className={mergeClasses(
          isRootOpen ? [...baseClasses, 'cm-menu--open'] : baseClasses,
          resolvedTheme,
          className,
        )}
        testID={dataTestId}
        data-menu-state={isRootOpen ? 'open' : 'closed'}
        onBlur={handleRootBlur}
        onPointerLeave={handleRootPointerLeave}
      >
        {triggerElement}
        {isRootOpen ? (
          <View className="cm-menu__popup" testID="menu-demo-popup">
            {renderItems(menuList, 0, rootMenuId)}
          </View>
        ) : null}
      </View>
    </>
  );
}
