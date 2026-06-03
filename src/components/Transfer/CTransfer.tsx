import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { normalizeThemeClassName } from '../Theme/normalizeThemeClassName';
import { useTheme } from '../Theme/useTheme';
import './index.scss';

export type CTransferItemKey = string | number;
export type CTransferDirection = 'left' | 'right';

export interface CTransferItem {
  readonly key: CTransferItemKey;
  readonly title: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly disabled?: boolean;
}

export interface CTransferProps {
  readonly dataSource: readonly CTransferItem[];
  readonly targetKeys?: readonly CTransferItemKey[];
  readonly defaultTargetKeys?: readonly CTransferItemKey[];
  readonly selectedKeys?: readonly CTransferItemKey[];
  readonly defaultSelectedKeys?: readonly CTransferItemKey[];
  readonly disabled?: boolean;
  readonly showSearch?: boolean;
  readonly operations?: readonly [React.ReactNode, React.ReactNode];
  readonly filterOption?: (inputValue: string, item: CTransferItem) => boolean;
  readonly onChange?: (
    targetKeys: readonly CTransferItemKey[],
    direction: CTransferDirection,
    moveKeys: readonly CTransferItemKey[],
  ) => void;
  readonly onSelectChange?: (
    sourceSelectedKeys: readonly CTransferItemKey[],
    targetSelectedKeys: readonly CTransferItemKey[],
  ) => void;
  readonly titles?: readonly [React.ReactNode, React.ReactNode];
  readonly render?: (item: CTransferItem) => React.ReactNode;
  readonly className?: string;
  readonly theme?: string;
  readonly 'aria-label'?: string;
  readonly 'data-testid'?: string;
}

const DEFAULT_TITLES: readonly [React.ReactNode, React.ReactNode] = ['Source', 'Target'];
const DEFAULT_OPERATIONS: readonly [React.ReactNode, React.ReactNode] = ['›', '‹'];

const isSameKey = (left: CTransferItemKey, right: CTransferItemKey): boolean => left === right;

const includesKey = (keys: readonly CTransferItemKey[], key: CTransferItemKey): boolean => {
  return keys.some((currentKey) => isSameKey(currentKey, key));
};

const withoutKeys = (
  keys: readonly CTransferItemKey[],
  removeKeys: readonly CTransferItemKey[],
): CTransferItemKey[] => keys.filter((key) => !includesKey(removeKeys, key));

const appendMissingKeys = (
  keys: readonly CTransferItemKey[],
  appendKeys: readonly CTransferItemKey[],
): CTransferItemKey[] => {
  const nextKeys = [...keys];

  appendKeys.forEach((key) => {
    if (!includesKey(nextKeys, key)) {
      nextKeys.push(key);
    }
  });

  return nextKeys;
};

const keepKeys = (
  keys: readonly CTransferItemKey[],
  keepKeysList: readonly CTransferItemKey[],
): CTransferItemKey[] => keys.filter((key) => includesKey(keepKeysList, key));

const toSearchText = (content: React.ReactNode): string => {
  if (content === null || content === undefined || typeof content === 'boolean') {
    return '';
  }

  if (typeof content === 'string' || typeof content === 'number') {
    return String(content);
  }

  if (Array.isArray(content)) {
    return content.map(toSearchText).join(' ');
  }

  return '';
};

const defaultFilterOption = (inputValue: string, item: CTransferItem): boolean => {
  const searchText = `${toSearchText(item.title)} ${toSearchText(item.description)}`.toLowerCase();

  return searchText.includes(inputValue.toLowerCase());
};

export function CTransfer({
  dataSource,
  targetKeys,
  defaultTargetKeys = [],
  selectedKeys,
  defaultSelectedKeys = [],
  disabled = false,
  showSearch = false,
  operations = DEFAULT_OPERATIONS,
  filterOption = defaultFilterOption,
  onChange,
  onSelectChange,
  titles = DEFAULT_TITLES,
  render,
  className,
  theme,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: CTransferProps): React.ReactElement {
  const resolvedTheme = normalizeThemeClassName(useTheme(theme));
  const isTargetControlled = targetKeys !== undefined;
  const isSelectionControlled = selectedKeys !== undefined;
  const [uncontrolledTargetKeys, setUncontrolledTargetKeys] =
    useState<readonly CTransferItemKey[]>(defaultTargetKeys);
  const [uncontrolledSelectedKeys, setUncontrolledSelectedKeys] =
    useState<readonly CTransferItemKey[]>(defaultSelectedKeys);
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const mergedTargetKeys = targetKeys ?? uncontrolledTargetKeys;
  const mergedSelectedKeys = selectedKeys ?? uncontrolledSelectedKeys;

  const sourceItems = useMemo(
    () => dataSource.filter((item) => !includesKey(mergedTargetKeys, item.key)),
    [dataSource, mergedTargetKeys],
  );
  const targetItems = useMemo(
    () => dataSource.filter((item) => includesKey(mergedTargetKeys, item.key)),
    [dataSource, mergedTargetKeys],
  );
  const sourceKeys = useMemo(() => sourceItems.map((item) => item.key), [sourceItems]);
  const visibleTargetKeys = useMemo(() => targetItems.map((item) => item.key), [targetItems]);
  const selectedSourceKeys = useMemo(
    () => sourceKeys.filter((key) => includesKey(mergedSelectedKeys, key)),
    [mergedSelectedKeys, sourceKeys],
  );
  const selectedTargetKeys = useMemo(
    () => visibleTargetKeys.filter((key) => includesKey(mergedSelectedKeys, key)),
    [mergedSelectedKeys, visibleTargetKeys],
  );
  const normalizedTitles = titles;

  const filterItems = useCallback(
    (items: readonly CTransferItem[], inputValue: string): readonly CTransferItem[] => {
      if (!showSearch || inputValue.trim() === '') {
        return items;
      }

      return items.filter((item) => filterOption(inputValue, item));
    },
    [filterOption, showSearch],
  );

  const visibleSourceItems = useMemo(
    () => filterItems(sourceItems, sourceSearch),
    [filterItems, sourceItems, sourceSearch],
  );
  const visibleTargetItems = useMemo(
    () => filterItems(targetItems, targetSearch),
    [filterItems, targetItems, targetSearch],
  );
  const enabledVisibleSourceKeys = useMemo(
    () => visibleSourceItems.filter((item) => item.disabled !== true).map((item) => item.key),
    [visibleSourceItems],
  );
  const enabledVisibleTargetKeys = useMemo(
    () => visibleTargetItems.filter((item) => item.disabled !== true).map((item) => item.key),
    [visibleTargetItems],
  );
  const selectedVisibleSourceKeys = useMemo(
    () => keepKeys(selectedSourceKeys, enabledVisibleSourceKeys),
    [enabledVisibleSourceKeys, selectedSourceKeys],
  );
  const selectedVisibleTargetKeys = useMemo(
    () => keepKeys(selectedTargetKeys, enabledVisibleTargetKeys),
    [enabledVisibleTargetKeys, selectedTargetKeys],
  );

  const setTargetKeys = (
    nextTargetKeys: readonly CTransferItemKey[],
    direction: CTransferDirection,
    moveKeys: readonly CTransferItemKey[],
  ): void => {
    if (!isTargetControlled) {
      setUncontrolledTargetKeys(nextTargetKeys);
    }

    onChange?.(nextTargetKeys, direction, moveKeys);
  };

  const setPanelSelection = (
    nextSourceSelectedKeys: readonly CTransferItemKey[],
    nextTargetSelectedKeys: readonly CTransferItemKey[],
  ): void => {
    const nextSelectedKeys = [...nextSourceSelectedKeys, ...nextTargetSelectedKeys];

    if (!isSelectionControlled) {
      setUncontrolledSelectedKeys(nextSelectedKeys);
    }

    onSelectChange?.(nextSourceSelectedKeys, nextTargetSelectedKeys);
  };

  const toggleSelection = (direction: CTransferDirection, item: CTransferItem): void => {
    if (disabled || item.disabled === true) {
      return;
    }

    const currentKeys = direction === 'left' ? selectedSourceKeys : selectedTargetKeys;
    const nextPanelKeys = includesKey(currentKeys, item.key)
      ? withoutKeys(currentKeys, [item.key])
      : [...currentKeys, item.key];

    if (direction === 'left') {
      setPanelSelection(nextPanelKeys, selectedTargetKeys);
      return;
    }

    setPanelSelection(selectedSourceKeys, nextPanelKeys);
  };

  const toggleSelectAll = (
    direction: CTransferDirection,
    enabledVisibleKeys: readonly CTransferItemKey[],
  ): void => {
    if (disabled || enabledVisibleKeys.length === 0) {
      return;
    }

    const currentKeys = direction === 'left' ? selectedSourceKeys : selectedTargetKeys;
    const allVisibleSelected = enabledVisibleKeys.every((key) => includesKey(currentKeys, key));
    const nextPanelKeys = allVisibleSelected
      ? withoutKeys(currentKeys, enabledVisibleKeys)
      : appendMissingKeys(currentKeys, enabledVisibleKeys);

    if (direction === 'left') {
      setPanelSelection(nextPanelKeys, selectedTargetKeys);
      return;
    }

    setPanelSelection(selectedSourceKeys, nextPanelKeys);
  };

  const moveToTarget = (moveKeys: readonly CTransferItemKey[]): void => {
    if (disabled) {
      return;
    }

    const enabledMoveKeys = sourceItems
      .filter((item) => includesKey(moveKeys, item.key) && item.disabled !== true)
      .map((item) => item.key);

    if (enabledMoveKeys.length === 0) {
      return;
    }

    const nextTargetKeys = appendMissingKeys(mergedTargetKeys, enabledMoveKeys);
    setTargetKeys(nextTargetKeys, 'right', enabledMoveKeys);
    setPanelSelection(withoutKeys(selectedSourceKeys, enabledMoveKeys), selectedTargetKeys);
  };

  const moveToSource = (moveKeys: readonly CTransferItemKey[]): void => {
    if (disabled) {
      return;
    }

    const enabledMoveKeys = targetItems
      .filter((item) => includesKey(moveKeys, item.key) && item.disabled !== true)
      .map((item) => item.key);

    if (enabledMoveKeys.length === 0) {
      return;
    }

    const nextTargetKeys = withoutKeys(mergedTargetKeys, enabledMoveKeys);
    setTargetKeys(nextTargetKeys, 'left', enabledMoveKeys);
    setPanelSelection(selectedSourceKeys, withoutKeys(selectedTargetKeys, enabledMoveKeys));
  };

  const renderItemContent = (item: CTransferItem): React.ReactNode => {
    if (render !== undefined) {
      return render(item);
    }

    return (
      <>
        <span className="cm-transfer__item-title">{item.title}</span>
        {item.description !== undefined ? (
          <span className="cm-transfer__item-description">{item.description}</span>
        ) : null}
      </>
    );
  };

  const renderPanel = (
    direction: CTransferDirection,
    title: React.ReactNode,
    items: readonly CTransferItem[],
    selectedKeys: readonly CTransferItemKey[],
    searchValue: string,
    setSearchValue: React.Dispatch<React.SetStateAction<string>>,
    enabledVisibleKeys: readonly CTransferItemKey[],
  ): React.ReactElement => {
    const allVisibleSelected =
      enabledVisibleKeys.length > 0 &&
      enabledVisibleKeys.every((key) => includesKey(selectedKeys, key));
    const someVisibleSelected = enabledVisibleKeys.some((key) => includesKey(selectedKeys, key));

    return (
      <section className={`cm-transfer__panel cm-transfer__panel--${direction}`}>
        <div className="cm-transfer__header">
          <label>
            <input
              type="checkbox"
              aria-label={`Select all ${direction === 'left' ? 'source' : 'target'} items`}
              checked={allVisibleSelected}
              disabled={disabled || enabledVisibleKeys.length === 0}
              ref={(element) => {
                if (element !== null) {
                  element.indeterminate = someVisibleSelected && !allVisibleSelected;
                }
              }}
              onChange={() => toggleSelectAll(direction, enabledVisibleKeys)}
            />
            <span className="cm-transfer__title">{title}</span>
          </label>
          <span className="cm-transfer__count">{items.length}</span>
        </div>
        {showSearch ? (
          <input
            className="cm-transfer__search"
            type="search"
            aria-label={`Search ${direction === 'left' ? 'source' : 'target'} items`}
            value={searchValue}
            disabled={disabled}
            onChange={(event) => setSearchValue(event.currentTarget.value)}
          />
        ) : null}
        <div className="cm-transfer__body">
          <div
            className="cm-transfer__list"
            role="listbox"
            aria-label={typeof title === 'string' ? title : undefined}
            aria-multiselectable="true"
          >
            {items.length > 0 ? (
              items.map((item) => {
                const selected = includesKey(selectedKeys, item.key);
                const itemDisabled = disabled || item.disabled === true;

                return (
                  <div
                    key={String(item.key)}
                    className={mergeClasses(
                      ['cm-transfer__item', 'cm-transfer__item-button'],
                      selected ? 'cm-transfer__item--selected' : undefined,
                      itemDisabled ? 'cm-transfer__item--disabled' : undefined,
                    )}
                    role="option"
                    aria-selected={selected}
                    aria-disabled={itemDisabled}
                    onClick={() => toggleSelection(direction, item)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleSelection(direction, item);
                      }
                    }}
                    tabIndex={itemDisabled ? -1 : 0}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={itemDisabled}
                      tabIndex={-1}
                      readOnly
                    />
                    {renderItemContent(item)}
                  </div>
                );
              })
            ) : (
              <div className="cm-transfer__empty">No data</div>
            )}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div
      className={mergeClasses(
        ['cm-transfer', ...(disabled ? ['cm-transfer--disabled'] : [])],
        resolvedTheme,
        className,
      )}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-testid={dataTestId}
    >
      {renderPanel(
        'left',
        normalizedTitles[0],
        visibleSourceItems,
        selectedSourceKeys,
        sourceSearch,
        setSourceSearch,
        enabledVisibleSourceKeys,
      )}
      <div className="cm-transfer__operations">
        <button
          className={mergeClasses(['cm-transfer__operation', 'cm-transfer__button'])}
          type="button"
          aria-label="Move selected to target"
          disabled={disabled || selectedVisibleSourceKeys.length === 0}
          onClick={() => moveToTarget(selectedVisibleSourceKeys)}
        >
          {operations[0]}
        </button>
        <button
          className={mergeClasses(['cm-transfer__operation', 'cm-transfer__button'])}
          type="button"
          aria-label="Move all to target"
          disabled={disabled || enabledVisibleSourceKeys.length === 0}
          onClick={() => moveToTarget(enabledVisibleSourceKeys)}
        >
          ››
        </button>
        <button
          className={mergeClasses(['cm-transfer__operation', 'cm-transfer__button'])}
          type="button"
          aria-label="Move selected to source"
          disabled={disabled || selectedVisibleTargetKeys.length === 0}
          onClick={() => moveToSource(selectedVisibleTargetKeys)}
        >
          {operations[1]}
        </button>
        <button
          className={mergeClasses(['cm-transfer__operation', 'cm-transfer__button'])}
          type="button"
          aria-label="Move all to source"
          disabled={disabled || enabledVisibleTargetKeys.length === 0}
          onClick={() => moveToSource(enabledVisibleTargetKeys)}
        >
          ‹‹
        </button>
      </div>
      {renderPanel(
        'right',
        normalizedTitles[1],
        visibleTargetItems,
        selectedTargetKeys,
        targetSearch,
        setTargetSearch,
        enabledVisibleTargetKeys,
      )}
    </div>
  );
}
