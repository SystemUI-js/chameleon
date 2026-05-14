import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import {
  CMenu as PackageEntryCMenu,
  Theme,
  type CMenuProps,
  type MenuListItem,
  type CMenuTrigger,
} from '../src';
import { CMenu } from '../src/components/Menu/Menu';

const SAMPLE_MENU_LIST: readonly MenuListItem[] = [
  { id: 'item-1', key: 'item-1', title: 'Item 1' },
  { id: 'item-2', key: 'item-2', title: 'Item 2', trigger: 'click', disabled: true },
];

const INTERACTION_MENU_LIST: readonly MenuListItem[] = [
  {
    id: 'parent-1',
    key: 'parent-1',
    title: 'Parent 1',
    children: [
      { id: 'leaf-1', key: 'leaf-1', title: 'Leaf 1' },
      { id: 'leaf-disabled', key: 'leaf-disabled', title: 'Disabled Leaf', disabled: true },
    ],
  },
  { id: 'leaf-root', key: 'leaf-root', title: 'Leaf Root' },
];

const MIXED_TRIGGER_MENU_LIST: readonly MenuListItem[] = [
  {
    id: 'hover-parent',
    key: 'hover-parent',
    title: 'Hover Parent',
    children: [{ id: 'hover-leaf', key: 'hover-leaf', title: 'Hover Leaf' }],
  },
  {
    id: 'sibling-parent',
    key: 'sibling-parent',
    title: 'Sibling Parent',
    children: [{ id: 'sibling-leaf', key: 'sibling-leaf', title: 'Sibling Leaf' }],
  },
  {
    id: 'click-parent',
    key: 'click-parent',
    title: 'Click Parent',
    trigger: 'click',
    children: [{ id: 'click-leaf', key: 'click-leaf', title: 'Click Leaf' }],
  },
  { id: 'mixed-root-leaf', key: 'mixed-root-leaf', title: 'Mixed Root Leaf' },
];

describe('CMenu', () => {
  it('exports CMenu from package entry', () => {
    render(
      <PackageEntryCMenu menuList={SAMPLE_MENU_LIST} data-testid="menu-package-entry">
        <button type="button">Trigger</button>
      </PackageEntryCMenu>,
    );

    const menu = screen.getByTestId('menu-package-entry');

    expect(PackageEntryCMenu).toBe(CMenu);
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveClass('cm-menu');
  });

  it('exports CMenuTrigger as React.ReactElement type', () => {
    const trigger: CMenuTrigger = <button type="button">Trigger</button>;
    expect(trigger.props.type).toBe('button');
  });

  it('exports MenuListItem with required key and trigger type', () => {
    const item: MenuListItem = { id: 'x', key: 'x', title: 'X', trigger: 'click' };
    expect(item.key).toBe('x');
    expect(item.trigger).toBe('click');
  });

  it('exports CMenuProps with required menuList', () => {
    const handleSelect = jest.fn();
    const triggerEl: CMenuTrigger = <button type="button">Trigger</button>;
    const props: CMenuProps = {
      children: triggerEl,
      menuList: SAMPLE_MENU_LIST,
      trigger: 'click',
      onSelect: handleSelect,
    };
    expect(props.children).toBeDefined();
    expect(props.menuList).toHaveLength(2);
    expect(props.trigger).toBe('click');
    expect(props.onSelect).toBeDefined();
  });

  it('renders closed root wrapper by default', () => {
    render(
      <CMenu menuList={SAMPLE_MENU_LIST} data-testid="menu-closed">
        <button type="button">Trigger</button>
      </CMenu>,
    );

    const menu = screen.getByTestId('menu-closed');

    expect(menu).toBeInTheDocument();
    expect(menu).toHaveClass('cm-menu');
    expect(menu).toHaveAttribute('data-menu-state', 'closed');
  });

  it('renders the root trigger as a direct child without wrapper', () => {
    render(
      <CMenu menuList={SAMPLE_MENU_LIST} data-testid="menu-direct-trigger">
        <button type="button" data-testid="menu-direct-trigger-button">
          Trigger
        </button>
      </CMenu>,
    );

    const menu = screen.getByTestId('menu-direct-trigger');
    const trigger = screen.getByTestId('menu-direct-trigger-button');

    expect(trigger.parentElement).toBe(menu);
    expect(menu.querySelector('.cm-menu__trigger')).not.toBeInTheDocument();
  });

  it('applies theme class from explicit theme prop', () => {
    render(
      <CMenu menuList={SAMPLE_MENU_LIST} theme="cm-theme--win98" data-testid="menu-themed">
        <button type="button">Trigger</button>
      </CMenu>,
    );

    const menu = screen.getByTestId('menu-themed');

    expect(menu).toHaveClass('cm-menu');
    expect(menu).toHaveClass('cm-theme--win98');
  });

  it('applies theme class from Theme provider when no explicit prop', () => {
    render(
      <Theme name="win98">
        <CMenu menuList={SAMPLE_MENU_LIST} data-testid="menu-provider-themed">
          <button type="button">Trigger</button>
        </CMenu>
      </Theme>,
    );

    const menu = screen.getByTestId('menu-provider-themed');

    expect(menu).toHaveClass('cm-menu');
    expect(menu).toHaveClass('cm-theme--win98');
  });

  it('explicit theme prop overrides Theme provider', () => {
    render(
      <Theme name="win98">
        <CMenu
          menuList={SAMPLE_MENU_LIST}
          theme="cm-theme--winxp"
          data-testid="menu-override-themed"
        >
          <button type="button">Trigger</button>
        </CMenu>
      </Theme>,
    );

    const menu = screen.getByTestId('menu-override-themed');

    expect(menu).toHaveClass('cm-menu');
    expect(menu).toHaveClass('cm-theme--winxp');
    expect(menu).not.toHaveClass('cm-theme--win98');
  });

  it('merges className with theme following correct order: base → theme → className', () => {
    render(
      <CMenu
        menuList={SAMPLE_MENU_LIST}
        className="custom-class"
        theme="cm-theme--win98"
        data-testid="menu-merged"
      >
        <button type="button">Trigger</button>
      </CMenu>,
    );

    const menu = screen.getByTestId('menu-merged');

    expect(menu).toHaveClass('cm-menu');
    expect(menu).toHaveClass('cm-theme--win98');
    expect(menu).toHaveClass('custom-class');
  });

  it('click trigger opens and closes root menu', () => {
    render(
      <CMenu menuList={INTERACTION_MENU_LIST} trigger="click" data-testid="menu-click-toggle">
        <button type="button">Open Menu</button>
      </CMenu>,
    );

    const menu = screen.getByTestId('menu-click-toggle');
    const trigger = screen.getByRole('button', { name: 'Open Menu' });

    expect(menu).toHaveAttribute('data-menu-state', 'closed');
    expect(screen.queryByTestId('cm-menu-list')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(menu).toHaveAttribute('data-menu-state', 'open');
    expect(screen.getByTestId('cm-menu-list')).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(menu).toHaveAttribute('data-menu-state', 'closed');
    expect(screen.queryByTestId('cm-menu-list')).not.toBeInTheDocument();
  });

  it('click trigger does not open root menu on pointer enter', () => {
    render(
      <CMenu menuList={INTERACTION_MENU_LIST} trigger="click" data-testid="menu-click-hover-guard">
        <button type="button">Open Menu</button>
      </CMenu>,
    );

    const menu = screen.getByTestId('menu-click-hover-guard');
    const trigger = screen.getByRole('button', { name: 'Open Menu' });

    fireEvent.pointerEnter(trigger);

    expect(menu).toHaveAttribute('data-menu-state', 'closed');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('hover root trigger still opens on click', () => {
    render(
      <CMenu menuList={SAMPLE_MENU_LIST} trigger="hover" data-testid="menu-hover-click-open">
        <button type="button">Hover Menu</button>
      </CMenu>,
    );

    const menu = screen.getByTestId('menu-hover-click-open');
    const trigger = screen.getByRole('button', { name: 'Hover Menu' });

    expect(menu).toHaveAttribute('data-menu-state', 'closed');

    fireEvent.click(trigger);

    expect(menu).toHaveAttribute('data-menu-state', 'open');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('exposes menu ARIA semantics for root and parent items', () => {
    render(
      <CMenu menuList={INTERACTION_MENU_LIST} trigger="click" data-testid="menu-aria">
        <button type="button">Open Menu</button>
      </CMenu>,
    );

    const trigger = screen.getByRole('button', { name: 'Open Menu' });

    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');

    fireEvent.click(trigger);

    const rootMenu = screen.getByRole('menu');
    const parentItem = screen.getByRole('menuitem', { name: /Parent 1/ });
    const submenuId = parentItem.getAttribute('aria-controls');
    const rootMenuId = rootMenu.getAttribute('id');

    expect(rootMenu).toBeInTheDocument();
    expect(rootMenu).toHaveAttribute('data-menu-depth', '0');
    expect(rootMenuId).toBeTruthy();
    expect(trigger).toHaveAttribute('aria-controls', rootMenuId ?? '');
    expect(parentItem).toHaveAttribute('aria-haspopup', 'menu');
    expect(parentItem).toHaveAttribute('aria-expanded', 'false');
    expect(submenuId).toBeTruthy();
    expect(submenuId).toContain('parent-1-submenu');
    expect(document.getElementById(submenuId ?? '')).not.toBeInTheDocument();

    fireEvent.click(parentItem);

    expect(parentItem).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(submenuId ?? '')).toBeInTheDocument();
  });

  it('outside click closes the menu', () => {
    render(
      <div>
        <CMenu menuList={INTERACTION_MENU_LIST} trigger="click" data-testid="menu-outside-close">
          <button type="button">Open Menu</button>
        </CMenu>
        <button type="button">Outside</button>
      </div>,
    );

    const menu = screen.getByTestId('menu-outside-close');
    const trigger = screen.getByRole('button', { name: 'Open Menu' });
    const outside = screen.getByRole('button', { name: 'Outside' });

    fireEvent.click(trigger);
    expect(menu).toHaveAttribute('data-menu-state', 'open');

    fireEvent.mouseDown(outside);
    expect(menu).toHaveAttribute('data-menu-state', 'closed');
    expect(screen.queryByTestId('cm-menu-list')).not.toBeInTheDocument();
  });

  it('leaf selection emits payload and closes', () => {
    const handleSelect = jest.fn();

    render(
      <CMenu
        menuList={INTERACTION_MENU_LIST}
        trigger="click"
        onSelect={handleSelect}
        data-testid="menu-leaf-select"
      >
        <button type="button">Open Menu</button>
      </CMenu>,
    );

    const menu = screen.getByTestId('menu-leaf-select');
    const trigger = screen.getByRole('button', { name: 'Open Menu' });

    fireEvent.click(trigger);
    expect(menu).toHaveAttribute('data-menu-state', 'open');

    fireEvent.click(screen.getByTestId('menu-item-parent-1'));
    expect(handleSelect).not.toHaveBeenCalled();
    expect(menu).toHaveAttribute('data-menu-state', 'open');

    fireEvent.click(screen.getByRole('menuitem', { name: 'Leaf 1' }));
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith({ id: 'leaf-1', key: 'leaf-1', title: 'Leaf 1' });
    expect(menu).toHaveAttribute('data-menu-state', 'closed');
    expect(screen.queryByTestId('cm-menu-list')).not.toBeInTheDocument();
  });

  it('disabled leaf does not select or close', () => {
    const handleSelect = jest.fn();

    render(
      <CMenu
        menuList={INTERACTION_MENU_LIST}
        trigger="click"
        onSelect={handleSelect}
        data-testid="menu-disabled-leaf"
      >
        <button type="button">Open Menu</button>
      </CMenu>,
    );

    const menu = screen.getByTestId('menu-disabled-leaf');
    const trigger = screen.getByRole('button', { name: 'Open Menu' });

    fireEvent.click(trigger);
    expect(menu).toHaveAttribute('data-menu-state', 'open');

    fireEvent.click(screen.getByTestId('menu-item-parent-1'));

    fireEvent.click(screen.getByRole('menuitem', { name: 'Disabled Leaf' }));
    expect(handleSelect).not.toHaveBeenCalled();
    expect(menu).toHaveAttribute('data-menu-state', 'open');
  });

  it('renders nested submenu trees recursively', () => {
    const nestedMenuList: readonly MenuListItem[] = [
      {
        id: 'root-parent',
        key: 'root-parent',
        title: 'Root Parent',
        children: [
          {
            id: 'child-parent',
            key: 'child-parent',
            title: 'Child Parent',
            children: [{ id: 'deep-leaf', key: 'deep-leaf', title: 'Deep Leaf' }],
          },
        ],
      },
    ];

    render(
      <CMenu menuList={nestedMenuList} trigger="click" data-testid="menu-recursive">
        <button type="button">Open Nested</button>
      </CMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open Nested' }));
    fireEvent.click(screen.getByTestId('menu-item-root-parent'));
    fireEvent.click(screen.getByTestId('menu-item-child-parent'));

    expect(screen.getByRole('menuitem', { name: 'Deep Leaf' })).toBeInTheDocument();
  });

  it('inherited trigger opens submenu', () => {
    const inheritedTriggerList: readonly MenuListItem[] = [
      {
        id: 'hover-parent',
        key: 'hover-parent',
        title: 'Hover Parent',
        children: [{ id: 'hover-leaf', key: 'hover-leaf', title: 'Hover Leaf' }],
      },
    ];

    render(
      <CMenu menuList={inheritedTriggerList} trigger="hover" data-testid="menu-inherited-trigger">
        <button type="button">Hover Trigger</button>
      </CMenu>,
    );

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Hover Trigger' }));
    fireEvent.pointerEnter(screen.getByTestId('menu-item-hover-parent'));

    expect(screen.getByRole('menuitem', { name: 'Hover Leaf' })).toBeInTheDocument();
  });

  it('hover parent click does not close hover-opened submenu', () => {
    render(
      <CMenu menuList={MIXED_TRIGGER_MENU_LIST} trigger="click" data-testid="menu-hover-stable">
        <button type="button">Hover Root</button>
      </CMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Hover Root' }));
    fireEvent.pointerEnter(screen.getByTestId('menu-item-hover-parent'));

    expect(screen.getByRole('menuitem', { name: 'Hover Leaf' })).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('menu-item-hover-parent'));

    expect(screen.getByRole('menuitem', { name: 'Hover Leaf' })).toBeInTheDocument();
  });

  it('explicit item trigger overrides parent trigger', () => {
    const overrideTriggerList: readonly MenuListItem[] = [
      {
        id: 'click-parent',
        key: 'click-parent',
        title: 'Click Parent',
        trigger: 'click',
        children: [{ id: 'click-leaf', key: 'click-leaf', title: 'Click Leaf' }],
      },
    ];

    render(
      <CMenu menuList={overrideTriggerList} trigger="hover" data-testid="menu-trigger-override">
        <button type="button">Hover Trigger</button>
      </CMenu>,
    );

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Hover Trigger' }));
    fireEvent.pointerEnter(screen.getByTestId('menu-item-click-parent'));

    expect(screen.queryByRole('menuitem', { name: 'Click Leaf' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('menu-item-click-parent'));

    expect(screen.getByRole('menuitem', { name: 'Click Leaf' })).toBeInTheDocument();
  });

  it('inherits click trigger through deeper submenu branches', () => {
    const deepInheritedTriggerList: readonly MenuListItem[] = [
      {
        id: 'root-parent',
        key: 'root-parent',
        title: 'Root Parent',
        children: [
          {
            id: 'click-parent',
            key: 'click-parent',
            title: 'Click Parent',
            trigger: 'click',
            children: [
              {
                id: 'deep-parent',
                key: 'deep-parent',
                title: 'Deep Parent',
                children: [{ id: 'deep-leaf', key: 'deep-leaf', title: 'Deep Leaf' }],
              },
            ],
          },
        ],
      },
    ];

    render(
      <CMenu menuList={deepInheritedTriggerList} trigger="click" data-testid="menu-deep-inherited">
        <button type="button">Deep Menu</button>
      </CMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Deep Menu' }));
    fireEvent.click(screen.getByTestId('menu-item-root-parent'));
    fireEvent.click(screen.getByTestId('menu-item-click-parent'));

    fireEvent.pointerEnter(screen.getByTestId('menu-item-deep-parent'));
    expect(screen.queryByRole('menuitem', { name: 'Deep Leaf' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('menu-item-deep-parent'));
    expect(screen.getByRole('menuitem', { name: 'Deep Leaf' })).toBeInTheDocument();
  });

  it('mixed trigger uses hover for nested parents and switches sibling branches', () => {
    render(
      <CMenu menuList={MIXED_TRIGGER_MENU_LIST} trigger="click" data-testid="menu-mixed-trigger">
        <button type="button">Mixed Menu</button>
      </CMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mixed Menu' }));

    fireEvent.pointerEnter(screen.getByTestId('menu-item-hover-parent'));
    expect(screen.getByRole('menuitem', { name: 'Hover Leaf' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Sibling Leaf' })).not.toBeInTheDocument();

    fireEvent.pointerEnter(screen.getByTestId('menu-item-sibling-parent'));
    expect(screen.getByRole('menuitem', { name: 'Sibling Leaf' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Hover Leaf' })).not.toBeInTheDocument();
  });

  it('mixed trigger keeps explicit click override for submenu parents', () => {
    render(
      <CMenu
        menuList={MIXED_TRIGGER_MENU_LIST}
        trigger="click"
        data-testid="menu-mixed-trigger-override"
      >
        <button type="button">Mixed Menu</button>
      </CMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mixed Menu' }));
    fireEvent.pointerEnter(screen.getByTestId('menu-item-click-parent'));

    expect(screen.queryByRole('menuitem', { name: 'Click Leaf' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('menu-item-click-parent'));
    expect(screen.getByRole('menuitem', { name: 'Click Leaf' })).toBeInTheDocument();
  });

  it('explicit hover trigger still opens submenu in click root mode', () => {
    const explicitHoverList: readonly MenuListItem[] = [
      {
        id: 'explicit-hover-parent',
        key: 'explicit-hover-parent',
        title: 'Explicit Hover Parent',
        trigger: 'hover',
        children: [{ id: 'explicit-hover-leaf', key: 'explicit-hover-leaf', title: 'Hover Child' }],
      },
    ];

    render(
      <CMenu menuList={explicitHoverList} trigger="click" data-testid="menu-explicit-hover">
        <button type="button">Mixed Menu</button>
      </CMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mixed Menu' }));
    fireEvent.pointerEnter(screen.getByTestId('menu-item-explicit-hover-parent'));

    expect(screen.getByRole('menuitem', { name: 'Hover Child' })).toBeInTheDocument();
  });

  it('mixed trigger closes after selecting a leaf from hover-opened submenu', () => {
    const handleSelect = jest.fn();

    render(
      <CMenu
        menuList={MIXED_TRIGGER_MENU_LIST}
        trigger="click"
        onSelect={handleSelect}
        data-testid="menu-mixed-select"
      >
        <button type="button">Mixed Menu</button>
      </CMenu>,
    );

    const menu = screen.getByTestId('menu-mixed-select');

    fireEvent.click(screen.getByRole('button', { name: 'Mixed Menu' }));
    fireEvent.pointerEnter(screen.getByTestId('menu-item-hover-parent'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hover Leaf' }));

    expect(handleSelect).toHaveBeenCalledWith({
      id: 'hover-leaf',
      key: 'hover-leaf',
      title: 'Hover Leaf',
    });
    expect(menu).toHaveAttribute('data-menu-state', 'closed');
    expect(screen.queryByTestId('cm-menu-list')).not.toBeInTheDocument();
  });

  it('mixed trigger closes on outside click after hover-opening a submenu', () => {
    render(
      <div>
        <CMenu menuList={MIXED_TRIGGER_MENU_LIST} trigger="click" data-testid="menu-mixed-outside">
          <button type="button">Mixed Menu</button>
        </CMenu>
        <button type="button">Outside</button>
      </div>,
    );

    const menu = screen.getByTestId('menu-mixed-outside');

    fireEvent.click(screen.getByRole('button', { name: 'Mixed Menu' }));
    fireEvent.pointerEnter(screen.getByTestId('menu-item-hover-parent'));

    expect(screen.getByRole('menuitem', { name: 'Hover Leaf' })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }));

    expect(menu).toHaveAttribute('data-menu-state', 'closed');
    expect(screen.queryByRole('menuitem', { name: 'Hover Leaf' })).not.toBeInTheDocument();
  });

  it('hover trigger opens and leaving menu tree closes', () => {
    render(
      <CMenu menuList={SAMPLE_MENU_LIST} trigger="hover" data-testid="menu-hover-close">
        <button type="button">Hover Trigger</button>
      </CMenu>,
    );

    const menu = screen.getByTestId('menu-hover-close');

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Hover Trigger' }));
    expect(menu).toHaveAttribute('data-menu-state', 'open');
    expect(screen.getByRole('menuitem', { name: 'Item 1' })).toBeInTheDocument();

    fireEvent.pointerLeave(menu);
    expect(menu).toHaveAttribute('data-menu-state', 'closed');
    expect(screen.queryByRole('menuitem', { name: 'Item 1' })).not.toBeInTheDocument();
  });

  it('disabled parent does not open submenu', () => {
    const disabledParentList: readonly MenuListItem[] = [
      {
        id: 'disabled-parent',
        key: 'disabled-parent',
        title: 'Disabled Parent',
        disabled: true,
        children: [{ id: 'hidden-child', key: 'hidden-child', title: 'Hidden Child' }],
      },
    ];

    render(
      <CMenu menuList={disabledParentList} trigger="click" data-testid="menu-disabled-parent">
        <button type="button">Open Menu</button>
      </CMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open Menu' }));
    fireEvent.click(screen.getByTestId('menu-item-disabled-parent'));

    expect(screen.queryByRole('menuitem', { name: 'Hidden Child' })).not.toBeInTheDocument();
  });

  it('nested leaf selection closes full tree', () => {
    const nestedLeaf: MenuListItem = {
      id: 'nested-leaf',
      key: 'nested-leaf',
      title: 'Nested Leaf',
    };
    const nestedSelectableList: readonly MenuListItem[] = [
      {
        id: 'select-parent',
        key: 'select-parent',
        title: 'Select Parent',
        children: [nestedLeaf],
      },
    ];
    const handleSelect = jest.fn();

    render(
      <CMenu
        menuList={nestedSelectableList}
        trigger="click"
        onSelect={handleSelect}
        data-testid="menu-nested-select"
      >
        <button type="button">Open Nested Select</button>
      </CMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open Nested Select' }));
    fireEvent.click(screen.getByTestId('menu-item-select-parent'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Nested Leaf' }));

    expect(handleSelect).toHaveBeenCalledWith(nestedLeaf);
    expect(screen.getByTestId('menu-nested-select')).toHaveAttribute('data-menu-state', 'closed');
    expect(screen.queryByRole('menuitem', { name: 'Select Parent' })).not.toBeInTheDocument();
  });

  it('rejects multiple trigger children', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      expect(() => {
        render(
          React.createElement(
            CMenu,
            {
              menuList: SAMPLE_MENU_LIST,
              'data-testid': 'menu-multi-child',
            } as CMenuProps,
            React.createElement('button', { type: 'button' }, 'Trigger 1'),
            React.createElement('button', { type: 'button' }, 'Trigger 2'),
          ),
        );
      }).toThrow();

      expect(consoleError).toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});
