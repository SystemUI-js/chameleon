import React from 'react';
import { CCheckbox } from '../Checkbox/Checkbox';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export interface CTreeDataNode {
  key: string;
  title: React.ReactNode;
  children?: readonly CTreeDataNode[];
  disabled?: boolean;
  disableCheckbox?: boolean;
}

export interface CTreeCheckInfo {
  checked: boolean;
  node: CTreeDataNode;
}

export interface CTreeSelectInfo {
  selected: boolean;
  node: CTreeDataNode;
}

export interface CTreeExpandInfo {
  expanded: boolean;
  node: CTreeDataNode;
}

export interface CTreeProps {
  treeData: readonly CTreeDataNode[];
  checkable?: boolean;
  checkedKeys?: readonly string[];
  defaultCheckedKeys?: readonly string[];
  expandedKeys?: readonly string[];
  defaultExpandedKeys?: readonly string[];
  selectedKeys?: readonly string[];
  defaultSelectedKeys?: readonly string[];
  selectable?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  onCheck?: (checkedKeys: string[], info: CTreeCheckInfo) => void;
  onExpand?: (expandedKeys: string[], info: CTreeExpandInfo) => void;
  onSelect?: (selectedKeys: string[], info: CTreeSelectInfo) => void;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

interface IndexedNode {
  node: CTreeDataNode;
  parentKey?: string;
  depth: number;
}

function normalizeKeys(keys: readonly string[] | undefined): Set<string> {
  return new Set(keys ?? []);
}

function indexTree(treeData: readonly CTreeDataNode[]): Map<string, IndexedNode> {
  const nodeMap = new Map<string, IndexedNode>();

  const visit = (nodes: readonly CTreeDataNode[], depth: number, parentKey?: string): void => {
    nodes.forEach((node) => {
      nodeMap.set(node.key, { node, parentKey, depth });
      visit(node.children ?? [], depth + 1, node.key);
    });
  };

  visit(treeData, 1);
  return nodeMap;
}

function flattenVisibleNodes(
  nodes: readonly CTreeDataNode[],
  expandedKeySet: ReadonlySet<string>,
): CTreeDataNode[] {
  return nodes.flatMap((node) => {
    if (!node.children?.length || !expandedKeySet.has(node.key)) {
      return [node];
    }

    return [node, ...flattenVisibleNodes(node.children, expandedKeySet)];
  });
}

function collectTreeKeys(treeData: readonly CTreeDataNode[]): string[] {
  return treeData.flatMap((node) => [node.key, ...collectTreeKeys(node.children ?? [])]);
}

function collectCheckableDescendantKeys(node: CTreeDataNode): string[] {
  if (node.disabled || node.disableCheckbox) {
    return [];
  }

  return [
    node.key,
    ...(node.children ?? []).flatMap((childNode) => collectCheckableDescendantKeys(childNode)),
  ];
}

function areAllCheckableDescendantsChecked(
  node: CTreeDataNode,
  checkedKeySet: ReadonlySet<string>,
): boolean {
  const childKeys = (node.children ?? []).flatMap((childNode) =>
    collectCheckableDescendantKeys(childNode),
  );

  return childKeys.length > 0 && childKeys.every((key) => checkedKeySet.has(key));
}

function areSomeCheckableDescendantsChecked(
  node: CTreeDataNode,
  checkedKeySet: ReadonlySet<string>,
): boolean {
  const childKeys = (node.children ?? []).flatMap((childNode) =>
    collectCheckableDescendantKeys(childNode),
  );

  return (
    childKeys.some((key) => checkedKeySet.has(key)) &&
    !areAllCheckableDescendantsChecked(node, checkedKeySet)
  );
}

function hasCheckableDescendants(node: CTreeDataNode): boolean {
  return (node.children ?? []).some(
    (childNode) => collectCheckableDescendantKeys(childNode).length > 0,
  );
}

function getTreeItemAriaChecked(
  checkable: boolean,
  isChecked: boolean,
  isIndeterminate: boolean,
): React.AriaAttributes['aria-checked'] {
  if (!checkable) {
    return undefined;
  }

  if (isIndeterminate) {
    return 'mixed';
  }

  return isChecked;
}

function getTreeNodeClassNames(
  hasChildren: boolean,
  isExpanded: boolean,
  isSelected: boolean,
  isChecked: boolean,
  isIndeterminate: boolean,
): string[] {
  const classNames = ['cm-tree__item', 'cm-tree__node'];

  classNames.push(hasChildren ? 'cm-tree__item--parent' : 'cm-tree__item--leaf');

  if (isExpanded) {
    classNames.push('cm-tree__node--expanded');
  }

  if (isSelected) {
    classNames.push('cm-tree__node--selected cm-tree__item--selected');
  }

  if (isChecked) {
    classNames.push('cm-tree__node--checked cm-tree__item--checked');
  }

  if (isIndeterminate) {
    classNames.push('cm-tree__node--indeterminate');
  }

  return classNames;
}

function recalculateAncestorChecks(
  nodeMap: ReadonlyMap<string, IndexedNode>,
  startKey: string,
  nextCheckedKeySet: Set<string>,
): void {
  let parentKey = nodeMap.get(startKey)?.parentKey;

  while (parentKey !== undefined) {
    const parentNode = nodeMap.get(parentKey)?.node;

    if (parentNode === undefined) {
      return;
    }

    if (!parentNode.disabled && !parentNode.disableCheckbox) {
      if (areAllCheckableDescendantsChecked(parentNode, nextCheckedKeySet)) {
        nextCheckedKeySet.add(parentNode.key);
      } else {
        nextCheckedKeySet.delete(parentNode.key);
      }
    }

    parentKey = nodeMap.get(parentKey)?.parentKey;
  }
}

function orderedKeys(treeData: readonly CTreeDataNode[], keySet: ReadonlySet<string>): string[] {
  return collectTreeKeys(treeData).filter((key) => keySet.has(key));
}

export function CTree({
  treeData,
  checkable = false,
  checkedKeys,
  defaultCheckedKeys = [],
  expandedKeys,
  defaultExpandedKeys = [],
  selectedKeys,
  defaultSelectedKeys = [],
  selectable = true,
  disabled = false,
  multiple = false,
  onCheck,
  onExpand,
  onSelect,
  className,
  theme,
  'data-testid': dataTestId,
}: CTreeProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const [uncontrolledCheckedKeys, setUncontrolledCheckedKeys] = React.useState(defaultCheckedKeys);
  const [uncontrolledExpandedKeys, setUncontrolledExpandedKeys] =
    React.useState(defaultExpandedKeys);
  const [uncontrolledSelectedKeys, setUncontrolledSelectedKeys] =
    React.useState(defaultSelectedKeys);
  const nodeMap = React.useMemo(() => indexTree(treeData), [treeData]);
  const isCheckControlled = checkedKeys !== undefined;
  const isExpandControlled = expandedKeys !== undefined;
  const isSelectControlled = selectedKeys !== undefined;
  const currentCheckedKeys = checkedKeys ?? uncontrolledCheckedKeys;
  const currentExpandedKeys = expandedKeys ?? uncontrolledExpandedKeys;
  const currentSelectedKeys = selectedKeys ?? uncontrolledSelectedKeys;
  const checkedKeySet = normalizeKeys(currentCheckedKeys);
  const expandedKeySet = normalizeKeys(currentExpandedKeys);
  const selectedKeySet = normalizeKeys(currentSelectedKeys);
  const visibleNodes = React.useMemo(
    () => flattenVisibleNodes(treeData, expandedKeySet),
    [treeData, expandedKeySet],
  );
  const [activeKey, setActiveKey] = React.useState<string | undefined>(visibleNodes[0]?.key);
  const treeInstanceId = React.useId().replace(/:/g, '');
  const nodeRefs = React.useRef(new Map<string, HTMLLIElement>());

  React.useEffect(() => {
    if (activeKey !== undefined && visibleNodes.some((node) => node.key === activeKey)) {
      return;
    }

    setActiveKey(visibleNodes[0]?.key);
  }, [activeKey, visibleNodes]);

  const focusNode = (key: string): void => {
    setActiveKey(key);
    nodeRefs.current.get(key)?.focus();
  };

  const setNodeRef =
    (key: string) =>
    (element: HTMLLIElement | null): void => {
      if (element === null) {
        nodeRefs.current.delete(key);
        return;
      }

      nodeRefs.current.set(key, element);
    };

  const isNodeDisabled = (node: CTreeDataNode): boolean => disabled || node.disabled === true;
  const isCheckboxDisabled = (node: CTreeDataNode): boolean =>
    isNodeDisabled(node) || node.disableCheckbox === true;

  const handleCheck = (node: CTreeDataNode, nextChecked: boolean): void => {
    if (isCheckboxDisabled(node)) {
      return;
    }

    const affectedKeys = collectCheckableDescendantKeys(node);
    const nextCheckedKeySet = new Set(currentCheckedKeys);

    affectedKeys.forEach((key) => {
      if (nextChecked) {
        nextCheckedKeySet.add(key);
        return;
      }

      nextCheckedKeySet.delete(key);
    });
    recalculateAncestorChecks(nodeMap, node.key, nextCheckedKeySet);

    const nextCheckedKeys = orderedKeys(treeData, nextCheckedKeySet);

    if (!isCheckControlled) {
      setUncontrolledCheckedKeys(nextCheckedKeys);
    }

    onCheck?.(nextCheckedKeys, { checked: nextChecked, node });
  };

  const handleSelect = (node: CTreeDataNode): void => {
    if (!selectable || isNodeDisabled(node)) {
      return;
    }

    const nextSelected = !selectedKeySet.has(node.key);
    const nextSelectedKeySet = new Set(multiple ? currentSelectedKeys : []);

    if (nextSelected) {
      nextSelectedKeySet.add(node.key);
    } else {
      nextSelectedKeySet.delete(node.key);
    }

    const nextSelectedKeys = orderedKeys(treeData, nextSelectedKeySet);

    if (!isSelectControlled) {
      setUncontrolledSelectedKeys(nextSelectedKeys);
    }

    onSelect?.(nextSelectedKeys, { selected: nextSelected, node });
  };

  const handleExpand = (node: CTreeDataNode, forceExpanded?: boolean): void => {
    if (isNodeDisabled(node) || !node.children?.length) {
      return;
    }

    const nextExpandedKeySet = new Set(currentExpandedKeys);
    const nextExpanded = forceExpanded ?? !expandedKeySet.has(node.key);

    if (nextExpanded) {
      nextExpandedKeySet.add(node.key);
    } else {
      nextExpandedKeySet.delete(node.key);
    }

    const nextExpandedKeys = orderedKeys(treeData, nextExpandedKeySet);

    if (!isExpandControlled) {
      setUncontrolledExpandedKeys(nextExpandedKeys);
    }

    onExpand?.(nextExpandedKeys, { expanded: nextExpanded, node });
  };

  const focusSiblingNode = (node: CTreeDataNode, offset: number): void => {
    const currentIndex = visibleNodes.findIndex((visibleNode) => visibleNode.key === node.key);
    const targetNode = visibleNodes[currentIndex + offset];

    if (targetNode !== undefined) {
      focusNode(targetNode.key);
    }
  };

  const handleArrowRight = (node: CTreeDataNode): void => {
    if (node.children?.length && !expandedKeySet.has(node.key)) {
      handleExpand(node, true);
      return;
    }

    const firstChild = node.children?.[0];
    if (firstChild !== undefined) {
      focusNode(firstChild.key);
    }
  };

  const handleArrowLeft = (node: CTreeDataNode): void => {
    if (node.children?.length && expandedKeySet.has(node.key)) {
      handleExpand(node, false);
      return;
    }

    const parentKey = nodeMap.get(node.key)?.parentKey;
    if (parentKey !== undefined) {
      focusNode(parentKey);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>, node: CTreeDataNode): void => {
    event.stopPropagation();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusSiblingNode(node, 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusSiblingNode(node, -1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        handleArrowRight(node);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        handleArrowLeft(node);
        break;
      case 'Enter':
        event.preventDefault();
        handleSelect(node);
        break;
      case ' ':
        event.preventDefault();
        if (checkable) {
          handleCheck(node, !checkedKeySet.has(node.key));
        } else {
          handleSelect(node);
        }
        break;
      default:
        break;
    }
  };

  const renderNodes = (nodes: readonly CTreeDataNode[], depth: number): React.ReactElement => {
    return (
      <ul
        className={depth === 0 ? 'cm-tree__list' : 'cm-tree__children'}
        role={depth === 0 ? 'tree' : 'group'}
      >
        {nodes.map((node) => {
          const hasChildren = Array.isArray(node.children) && node.children.length > 0;
          const isChecked = checkedKeySet.has(node.key);
          const isIndeterminate =
            hasCheckableDescendants(node) &&
            areSomeCheckableDescendantsChecked(node, checkedKeySet);
          const isExpanded = expandedKeySet.has(node.key);
          const isSelected = selectedKeySet.has(node.key);
          const isCurrentNodeDisabled = isNodeDisabled(node);
          const titleId = `${treeInstanceId}-${node.key}-title`;

          return (
            <li
              key={node.key}
              ref={setNodeRef(node.key)}
              aria-checked={getTreeItemAriaChecked(checkable, isChecked, isIndeterminate)}
              aria-disabled={isCurrentNodeDisabled || undefined}
              aria-expanded={hasChildren ? isExpanded : undefined}
              aria-labelledby={titleId}
              aria-selected={selectable ? isSelected : undefined}
              className={mergeClasses(
                getTreeNodeClassNames(
                  hasChildren,
                  isExpanded,
                  isSelected,
                  isChecked,
                  isIndeterminate,
                ),
              )}
              data-tree-node-key={node.key}
              role="treeitem"
              tabIndex={(activeKey ?? visibleNodes[0]?.key) === node.key ? 0 : -1}
              onFocus={() => setActiveKey(node.key)}
              onKeyDown={(event) => handleKeyDown(event, node)}
            >
              <div className="cm-tree__node-content">
                {hasChildren ? (
                  <button
                    aria-label={
                      isExpanded ? `Collapse ${String(node.title)}` : `Expand ${String(node.title)}`
                    }
                    className="cm-tree__switcher"
                    disabled={isCurrentNodeDisabled}
                    onClick={() => handleExpand(node)}
                    type="button"
                  />
                ) : null}
                {checkable ? (
                  <CCheckbox
                    checked={isChecked}
                    className="cm-tree__checkbox"
                    disabled={isCheckboxDisabled(node)}
                    indeterminate={isIndeterminate}
                    onChange={(nextChecked) => handleCheck(node, nextChecked)}
                  />
                ) : null}
                <button
                  id={titleId}
                  className="cm-tree__title"
                  disabled={!selectable || isCurrentNodeDisabled}
                  onClick={() => handleSelect(node)}
                  type="button"
                >
                  {node.title}
                </button>
              </div>
              {hasChildren && isExpanded ? renderNodes(node.children ?? [], depth + 1) : null}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div
      className={mergeClasses(
        ['cm-tree', disabled ? 'cm-tree--disabled' : undefined].filter(
          (itemClass): itemClass is string => itemClass !== undefined,
        ),
        resolvedTheme,
        className,
      )}
      data-testid={dataTestId}
    >
      {renderNodes(treeData, 0)}
    </div>
  );
}
