import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { type CTreeDataNode, type CTreeProps, CTree as PackageEntryCTree, Theme } from '../src';
import { CTree } from '../src/components/Tree';

const TREE_DATA: readonly CTreeDataNode[] = [
  {
    key: 'parent',
    title: 'Parent',
    children: [
      { key: 'child-a', title: 'Child A' },
      {
        key: 'child-b',
        title: 'Child B',
        children: [{ key: 'grandchild', title: 'Grandchild' }],
      },
    ],
  },
  { key: 'sibling', title: 'Sibling' },
];

const DISABLED_TREE_DATA: readonly CTreeDataNode[] = [
  {
    key: 'parent',
    title: 'Parent',
    children: [
      { key: 'child-a', title: 'Child A' },
      { key: 'child-disabled', title: 'Child Disabled', disabled: true },
      { key: 'child-checkbox-disabled', title: 'Child Checkbox Disabled', disableCheckbox: true },
    ],
  },
];

const HALF_SELECTED_TREE_DATA: readonly CTreeDataNode[] = [
  {
    key: 'parent',
    title: 'Parent',
    children: [
      { key: 'child-1', title: 'Child 1' },
      { key: 'child-2', title: 'Child 2' },
    ],
  },
];

describe('CTree', () => {
  it('exports CTree from package entry and direct component path', () => {
    render(<PackageEntryCTree treeData={TREE_DATA} data-testid="tree-package-entry" />);

    const treeRoot = screen.getByTestId('tree-package-entry');

    expect(PackageEntryCTree).toBe(CTree);
    expect(treeRoot).toBeInTheDocument();
    expect(treeRoot).toHaveClass('cm-tree');
  });

  it('exports CTreeProps and CTreeDataNode types', () => {
    const handleSelect = jest.fn();
    const props: CTreeProps = {
      treeData: TREE_DATA,
      checkable: true,
      defaultCheckedKeys: ['child-a'],
      onSelect: handleSelect,
    };

    expect(props.treeData).toHaveLength(2);
    expect(props.checkable).toBe(true);
    expect(props.onSelect).toBeDefined();
  });

  it('merges base, theme and custom class names', () => {
    render(
      <CTree
        className="custom-tree"
        treeData={TREE_DATA}
        data-testid="tree-classes"
        theme="cm-theme--win98"
      />,
    );

    const treeRoot = screen.getByTestId('tree-classes');

    expect(treeRoot).toHaveClass('cm-tree');
    expect(treeRoot).toHaveClass('cm-theme--win98');
    expect(treeRoot).toHaveClass('custom-tree');
  });

  it('inherits theme class from Theme provider', () => {
    render(
      <Theme name="win7">
        <CTree treeData={TREE_DATA} data-testid="tree-provider-theme" />
      </Theme>,
    );

    const treeRoot = screen.getByTestId('tree-provider-theme');

    expect(treeRoot).toHaveClass('cm-tree');
    expect(treeRoot).toHaveClass('cm-theme--win7');
  });

  it('renders ARIA tree semantics and required state classes for hierarchical data', () => {
    render(
      <CTree
        checkable
        treeData={TREE_DATA}
        defaultCheckedKeys={['child-a']}
        defaultExpandedKeys={['parent']}
      />,
    );

    const tree = screen.getByRole('tree');
    const parent = screen.getByRole('treeitem', { name: /Parent/ });
    const childA = screen.getByRole('treeitem', { name: /Child A/ });
    const sibling = screen.getByRole('treeitem', { name: /Sibling/ });

    expect(tree).toHaveClass('cm-tree__list');
    expect(parent).toHaveClass('cm-tree__node', 'cm-tree__node--expanded');
    expect(parent).toHaveAttribute('aria-expanded', 'true');
    expect(parent).toHaveAttribute('aria-selected', 'false');
    // Task 5 semantic correction: 1 of N checked descendants means the parent is mixed.
    expect(parent).toHaveAttribute('aria-checked', 'mixed');
    expect(childA).toHaveClass('cm-tree__node--checked');
    expect(childA).toHaveAttribute('aria-checked', 'true');
    expect(sibling).not.toHaveAttribute('aria-expanded');
    expect(within(parent).getAllByRole('group')[0]).toHaveClass('cm-tree__children');
  });

  it('renders a mixed parent state when some checkable children are checked', () => {
    render(
      <CTree
        checkable
        treeData={HALF_SELECTED_TREE_DATA}
        defaultCheckedKeys={['child-1']}
        defaultExpandedKeys={['parent']}
      />,
    );

    const parent = screen.getByRole('treeitem', { name: /Parent/ });
    const parentCheckbox = within(parent).getAllByRole('checkbox')[0] as HTMLInputElement;

    expect(parent).toHaveAttribute('aria-checked', 'mixed');
    expect(parent).toHaveClass('cm-tree__node--indeterminate');
    expect(parentCheckbox).toHaveClass('cm-checkbox__input');
    expect(parentCheckbox.indeterminate).toBe(true);
  });

  it('renders a checked parent state when all checkable children are checked', () => {
    render(
      <CTree
        checkable
        treeData={HALF_SELECTED_TREE_DATA}
        defaultCheckedKeys={['parent', 'child-1', 'child-2']}
        defaultExpandedKeys={['parent']}
      />,
    );

    const parent = screen.getByRole('treeitem', { name: /Parent/ });
    const parentCheckbox = within(parent).getAllByRole('checkbox')[0] as HTMLInputElement;

    expect(parent).toHaveAttribute('aria-checked', 'true');
    expect(parent).not.toHaveClass('cm-tree__node--indeterminate');
    expect(parentCheckbox.indeterminate).toBe(false);
  });

  it('renders an unchecked parent state when no checkable children are checked', () => {
    render(
      <CTree
        checkable
        treeData={HALF_SELECTED_TREE_DATA}
        defaultCheckedKeys={[]}
        defaultExpandedKeys={['parent']}
      />,
    );

    const parent = screen.getByRole('treeitem', { name: /Parent/ });
    const parentCheckbox = within(parent).getAllByRole('checkbox')[0] as HTMLInputElement;

    expect(parent).toHaveAttribute('aria-checked', 'false');
    expect(parent).not.toHaveClass('cm-tree__node--indeterminate');
    expect(parentCheckbox.indeterminate).toBe(false);
  });

  it('expands and collapses uncontrolled nodes by clicking the switcher and calls onExpand', () => {
    const handleExpand = jest.fn();
    render(<CTree treeData={TREE_DATA} onExpand={handleExpand} />);

    const parent = screen.getByRole('treeitem', { name: /Parent/ });

    expect(parent).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('treeitem', { name: /Child A/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand Parent' }));

    expect(parent).toHaveAttribute('aria-expanded', 'true');
    expect(parent).toHaveClass('cm-tree__node--expanded');
    expect(screen.getByRole('treeitem', { name: /Child A/ })).toBeInTheDocument();
    expect(handleExpand).toHaveBeenLastCalledWith(['parent'], {
      expanded: true,
      node: TREE_DATA[0],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Collapse Parent' }));

    expect(parent).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('treeitem', { name: /Child A/ })).not.toBeInTheDocument();
    expect(handleExpand).toHaveBeenLastCalledWith([], { expanded: false, node: TREE_DATA[0] });
  });

  it('respects defaultExpandedKeys and controlled expandedKeys', () => {
    const { rerender } = render(<CTree treeData={TREE_DATA} defaultExpandedKeys={['parent']} />);

    const parent = screen.getByRole('treeitem', { name: /Parent/ });

    expect(parent).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('treeitem', { name: /Child A/ })).toBeInTheDocument();

    rerender(<CTree treeData={TREE_DATA} expandedKeys={['parent']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Parent' }));

    expect(screen.getByRole('treeitem', { name: /Parent/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('treeitem', { name: /Child A/ })).toBeInTheDocument();
  });

  it('cascades uncontrolled checks from parent to enabled descendants and back', () => {
    const handleCheck = jest.fn();
    render(
      <CTree
        checkable
        treeData={DISABLED_TREE_DATA}
        defaultExpandedKeys={['parent']}
        onCheck={handleCheck}
      />,
    );

    const parent = screen.getByRole('treeitem', { name: /Parent/ });
    const disabledChild = screen.getByRole('treeitem', { name: /Child Disabled/ });
    const disabledCheckboxChild = screen.getByRole('treeitem', {
      name: /Child Checkbox Disabled/,
    });
    const parentCheckbox = within(parent).getAllByRole('checkbox')[0];

    fireEvent.click(parentCheckbox);

    expect(parent).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('treeitem', { name: /Child A/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(disabledChild).toHaveAttribute('aria-checked', 'false');
    expect(within(disabledChild).getByRole('checkbox')).toBeDisabled();
    expect(disabledCheckboxChild).toHaveAttribute('aria-checked', 'false');
    expect(within(disabledCheckboxChild).getByRole('checkbox')).toBeDisabled();
    expect(handleCheck).toHaveBeenLastCalledWith(['parent', 'child-a'], {
      checked: true,
      node: DISABLED_TREE_DATA[0],
    });

    fireEvent.click(parentCheckbox);

    expect(parent).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('treeitem', { name: /Child A/ })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(handleCheck).toHaveBeenLastCalledWith([], {
      checked: false,
      node: DISABLED_TREE_DATA[0],
    });
  });

  it('recalculates ancestor checked state when children change', () => {
    render(
      <CTree
        checkable
        treeData={TREE_DATA}
        defaultCheckedKeys={['parent', 'child-a', 'child-b', 'grandchild']}
        defaultExpandedKeys={['parent', 'child-b']}
      />,
    );

    const parent = screen.getByRole('treeitem', { name: /Parent/ });
    const childA = screen.getByRole('treeitem', { name: /Child A/ });

    fireEvent.click(within(childA).getByRole('checkbox'));

    expect(parent).toHaveAttribute('aria-checked', 'mixed');
    expect(parent).not.toHaveClass('cm-tree__node--checked');
    expect(parent).toHaveClass('cm-tree__node--indeterminate');
  });

  it('keeps controlled checkedKeys stable while reporting cascaded next keys', () => {
    const handleCheck = jest.fn();
    render(
      <CTree
        checkable
        checkedKeys={['sibling']}
        treeData={TREE_DATA}
        defaultExpandedKeys={['parent']}
        onCheck={handleCheck}
      />,
    );

    const parent = screen.getByRole('treeitem', { name: /Parent/ });
    const parentCheckbox = within(parent).getAllByRole('checkbox')[0];

    fireEvent.click(parentCheckbox);
    expect(parent).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('treeitem', { name: /Sibling/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(handleCheck).toHaveBeenLastCalledWith(
      ['parent', 'child-a', 'child-b', 'grandchild', 'sibling'],
      { checked: true, node: TREE_DATA[0] },
    );
  });

  it('fires onSelect and toggles selected state', () => {
    const handleSelect = jest.fn();
    render(<CTree treeData={TREE_DATA} defaultExpandedKeys={['parent']} onSelect={handleSelect} />);

    const childAButton = screen.getByRole('button', { name: 'Child A' });
    const childA = screen.getByRole('treeitem', { name: /Child A/ });

    fireEvent.click(childAButton);

    expect(childA).toHaveAttribute('aria-selected', 'true');
    expect(childA).toHaveClass('cm-tree__node--selected');
    expect(handleSelect).toHaveBeenLastCalledWith(['child-a'], {
      selected: true,
      node: TREE_DATA[0].children?.[0],
    });

    fireEvent.click(childAButton);

    expect(childA).toHaveAttribute('aria-selected', 'false');
    expect(handleSelect).toHaveBeenLastCalledWith([], {
      selected: false,
      node: TREE_DATA[0].children?.[0],
    });
  });

  it('supports multiple selection, controlled selectedKeys, selectable=false, and disabled nodes', () => {
    const handleSelect = jest.fn();
    const { rerender } = render(
      <CTree
        multiple
        treeData={DISABLED_TREE_DATA}
        defaultExpandedKeys={['parent']}
        onSelect={handleSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Child A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Parent' }));
    fireEvent.click(screen.getByRole('button', { name: 'Child Disabled' }));

    expect(screen.getByRole('treeitem', { name: /Child A/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('treeitem', { name: /Parent/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('treeitem', { name: /Child Disabled/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(handleSelect).not.toHaveBeenLastCalledWith(
      expect.arrayContaining(['child-disabled']),
      expect.any(Object),
    );

    rerender(
      <CTree
        selectable={false}
        selectedKeys={['child-a']}
        treeData={DISABLED_TREE_DATA}
        defaultExpandedKeys={['parent']}
        onSelect={handleSelect}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Child A' }));

    expect(screen.getByRole('treeitem', { name: /Child A/ })).not.toHaveAttribute('aria-selected');
  });

  it('prevents all interaction when the tree is disabled', () => {
    const handleCheck = jest.fn();
    const handleExpand = jest.fn();
    const handleSelect = jest.fn();
    render(
      <CTree
        checkable
        disabled
        treeData={TREE_DATA}
        data-testid="disabled-tree"
        onCheck={handleCheck}
        onExpand={handleExpand}
        onSelect={handleSelect}
      />,
    );

    const treeRoot = screen.getByTestId('disabled-tree');
    const parent = screen.getByRole('treeitem', { name: /Parent/ });

    expect(treeRoot).toHaveClass('cm-tree--disabled');
    expect(parent).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Expand Parent' })).toBeDisabled();
    expect(within(parent).getByRole('checkbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Parent' })).toBeDisabled();
    expect(handleCheck).not.toHaveBeenCalled();
    expect(handleExpand).not.toHaveBeenCalled();
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('supports ArrowUp/Down/Left/Right, Enter, and Space keyboard navigation', () => {
    const handleCheck = jest.fn();
    const handleExpand = jest.fn();
    const handleSelect = jest.fn();
    render(
      <CTree
        checkable
        treeData={TREE_DATA}
        onCheck={handleCheck}
        onExpand={handleExpand}
        onSelect={handleSelect}
      />,
    );

    const parent = screen.getByRole('treeitem', { name: /Parent/ });
    parent.focus();
    fireEvent.keyDown(parent, { key: 'ArrowRight' });

    expect(parent).toHaveAttribute('aria-expanded', 'true');
    expect(handleExpand).toHaveBeenLastCalledWith(['parent'], {
      expanded: true,
      node: TREE_DATA[0],
    });

    fireEvent.keyDown(parent, { key: 'ArrowDown' });
    let childA = screen.getByRole('treeitem', { name: /Child A/ });
    expect(childA).toHaveFocus();

    fireEvent.keyDown(childA, { key: 'Enter' });
    childA = screen.getByRole('treeitem', { name: /Child A/ });
    expect(childA).toHaveAttribute('aria-selected', 'true');
    expect(handleSelect).toHaveBeenLastCalledWith(['child-a'], {
      selected: true,
      node: TREE_DATA[0].children?.[0],
    });

    fireEvent.keyDown(childA, { key: ' ' });
    childA = screen.getByRole('treeitem', { name: /Child A/ });
    expect(childA).toHaveAttribute('aria-checked', 'true');
    expect(handleCheck).toHaveBeenLastCalledWith(['child-a'], {
      checked: true,
      node: TREE_DATA[0].children?.[0],
    });

    fireEvent.keyDown(childA, { key: 'ArrowUp' });
    expect(parent).toHaveFocus();

    fireEvent.keyDown(parent, { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('treeitem', { name: /Child A/ }), { key: 'ArrowDown' });
    const childB = screen.getByRole('treeitem', { name: /Child B/ });
    expect(childB).toHaveFocus();

    fireEvent.keyDown(childB, { key: 'ArrowRight' });
    expect(childB).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(childB, { key: 'ArrowRight' });
    expect(screen.getByRole('treeitem', { name: /Grandchild/ })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('treeitem', { name: /Grandchild/ }), { key: 'ArrowLeft' });
    expect(childB).toHaveFocus();

    fireEvent.keyDown(childB, { key: 'ArrowLeft' });
    expect(childB).toHaveAttribute('aria-expanded', 'false');
  });
});
