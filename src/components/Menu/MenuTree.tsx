import type React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';

export type CMenuTrigger = React.ReactElement;

export interface MenuListItem {
  id: string;
  key: string;
  title: string;
  children?: readonly MenuListItem[];
  trigger?: 'click' | 'hover';
  disabled?: boolean;
  'data-testid'?: string;
}

export type MenuTriggerMode = 'click' | 'hover';

export interface MenuTreeProps {
  items: readonly MenuListItem[];
  depth: number;
  listId: string;
  menuInstanceId: string;
  openBranchByDepth: readonly string[];
  onOpenBranchAtDepth: (depth: number, id: string) => void;
  onToggleBranchAtDepth: (depth: number, id: string) => void;
  onCloseAllMenus: () => void;
  onSelect?: (item: MenuListItem) => void;
  closeOnSelect?: boolean;
  parentPath?: string;
  parentTrigger?: MenuTriggerMode;
}

const DEFAULT_SUBMENU_TRIGGER_MODE: MenuTriggerMode = 'hover';

function resolveParentItemTriggerMode(itemTrigger: MenuTriggerMode | undefined): MenuTriggerMode {
  return itemTrigger ?? DEFAULT_SUBMENU_TRIGGER_MODE;
}

export function MenuTree({
  items,
  depth,
  listId,
  menuInstanceId,
  openBranchByDepth,
  onOpenBranchAtDepth,
  onToggleBranchAtDepth,
  onCloseAllMenus,
  onSelect,
  closeOnSelect = true,
  parentPath = '',
  parentTrigger,
}: MenuTreeProps): React.ReactElement {
  const menuRole: React.AriaRole = 'menu';

  return (
    <ul
      id={listId}
      role={menuRole}
      className="cm-menu__list"
      data-testid="cm-menu-list"
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
              onOpenBranchAtDepth(depth, item.id);
            }

            return;
          }

          onToggleBranchAtDepth(depth, item.id);
        };

        const handleParentPointerEnter = (): void => {
          if (item.disabled || effectiveTrigger !== 'hover') {
            return;
          }

          onOpenBranchAtDepth(depth, item.id);
        };

        const handleLeafClick = (): void => {
          if (item.disabled) {
            return;
          }

          onSelect?.(item);

          if (closeOnSelect) {
            onCloseAllMenus();
          }
        };

        return (
          <li
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
            <button
              type="button"
              role="menuitem"
              className={mergeClasses(
                [
                  'cm-menu__item-button',
                  isParent ? 'cm-menu__item-button--parent' : 'cm-menu__item-button--leaf',
                ],
                item.disabled ? 'cm-menu__item-button--disabled' : undefined,
              )}
              data-testid={item['data-testid'] ?? `menu-item-${item.id}`}
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
              {item.title}
              {isParent && <span className="cm-menu__caret">▸</span>}
            </button>
            {isParent && isBranchOpen ? (
              <div className="cm-menu__popup cm-menu__submenu">
                <MenuTree
                  items={item.children ?? []}
                  depth={depth + 1}
                  listId={submenuId}
                  menuInstanceId={menuInstanceId}
                  openBranchByDepth={openBranchByDepth}
                  onOpenBranchAtDepth={onOpenBranchAtDepth}
                  onToggleBranchAtDepth={onToggleBranchAtDepth}
                  onCloseAllMenus={onCloseAllMenus}
                  onSelect={onSelect}
                  closeOnSelect={closeOnSelect}
                  parentPath={itemPath}
                  parentTrigger={effectiveTrigger}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
