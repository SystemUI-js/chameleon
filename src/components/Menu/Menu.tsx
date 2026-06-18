import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { useTheme } from '../Theme/useTheme';
import { MenuTree, type CMenuTrigger, type MenuListItem, type MenuTriggerMode } from './MenuTree';
import './index.scss';

export type { CMenuTrigger, MenuListItem } from './MenuTree';

export interface CMenuProps {
  children: CMenuTrigger;
  menuList: readonly MenuListItem[];
  trigger?: 'click' | 'hover';
  onSelect?: (item: MenuListItem) => void;
  closeOnSelect?: boolean;
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

const DEFAULT_ROOT_TRIGGER_MODE: MenuTriggerMode = 'click';

function resolveRootTriggerMode(trigger: MenuTriggerMode | undefined): MenuTriggerMode {
  return trigger ?? DEFAULT_ROOT_TRIGGER_MODE;
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
  closeOnSelect = true,
  className,
  theme,
  'data-testid': dataTestId,
}: CMenuProps): React.ReactElement {
  const resolvedTheme = resolveThemeClass(useTheme(theme));
  const baseClasses = ['cm-menu'];
  const menuInstanceId = React.useId().replace(/:/g, '');
  const rootMenuId = `${menuInstanceId}-menu`;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [isRootOpen, setIsRootOpen] = React.useState(false);
  const [openBranchByDepth, setOpenBranchByDepth] = React.useState<string[]>([]);
  const rootTriggerMode = resolveRootTriggerMode(trigger);

  if (React.Children.count(children) > 1) {
    console.error('CMenu expects a single trigger child, but received multiple children.');
  }

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

  const handleRootPointerLeave: React.PointerEventHandler<HTMLDivElement> = () => {
    if (rootTriggerMode === 'hover') {
      closeAllMenus();
    }
  };

  const triggerElement = React.cloneElement(children as React.ReactElement<TriggerElementProps>, {
    'aria-controls': isRootOpen ? rootMenuId : undefined,
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
      {triggerElement}
      {isRootOpen ? (
        <div className="cm-menu__popup" data-testid="menu-demo-popup">
          <MenuTree
            items={menuList}
            depth={0}
            listId={rootMenuId}
            menuInstanceId={menuInstanceId}
            openBranchByDepth={openBranchByDepth}
            onOpenBranchAtDepth={openBranchAtDepth}
            onToggleBranchAtDepth={toggleBranchAtDepth}
            onCloseAllMenus={closeAllMenus}
            onSelect={onSelect}
            closeOnSelect={closeOnSelect}
          />
        </div>
      ) : null}
    </div>
  );
}
