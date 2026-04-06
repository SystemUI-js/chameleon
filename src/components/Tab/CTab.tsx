import React from 'react';
import { mergeClasses } from '../Theme/mergeClasses';
import { useTheme } from '../Theme/useTheme';
import { CTabItem, type CTabItemProps } from './CTabItem';
import './index.scss';

export interface CTabProps {
  children?: React.ReactNode;
  className?: string;
  theme?: string;
  'data-testid'?: string;
}

interface CTabItemEntry {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

function resolveTabItemId(instanceId: string, key: string | null, index: number): string {
  const keySegment = key === null ? `tab-${index}` : encodeURIComponent(key).replace(/%/g, '_');
  return `${instanceId}-${keySegment}`;
}

function isTabItemElement(
  child: React.ReactNode,
): child is React.ReactElement<CTabItemProps, typeof CTabItem> {
  return React.isValidElement(child) && child.type === CTabItem;
}

export function CTab({
  children,
  className,
  theme,
  'data-testid': dataTestId,
}: CTabProps): React.ReactElement {
  const resolvedTheme = useTheme(theme);
  const instanceId = React.useId().replace(/:/g, '');

  const tabItems = React.useMemo<readonly CTabItemEntry[]>(() => {
    return React.Children.toArray(children).reduce<CTabItemEntry[]>((items, child) => {
      if (!isTabItemElement(child)) {
        return items;
      }

      items.push({
        id: resolveTabItemId(instanceId, child.key, items.length),
        title: child.props.title,
        content: child.props.children,
      });

      return items;
    }, []);
  }, [children, instanceId]);

  const [activeTabId, setActiveTabId] = React.useState<string | undefined>(undefined);
  const effectiveActiveTabId = activeTabId ?? tabItems[0]?.id;

  React.useEffect(() => {
    if (tabItems.length === 0) {
      setActiveTabId((current) => (current === undefined ? current : undefined));
      return;
    }

    if (activeTabId !== undefined && !tabItems.some((item) => item.id === activeTabId)) {
      setActiveTabId(tabItems[0].id);
    }
  }, [activeTabId, tabItems]);

  return (
    <div className={mergeClasses(['cm-ctab'], resolvedTheme, className)} data-testid={dataTestId}>
      <div role="tablist" className="cm-ctab__list">
        {tabItems.map((item) => {
          const isActive = item.id === effectiveActiveTabId;
          const tabId = `${item.id}-tab`;
          const panelId = `${item.id}-panel`;

          return (
            <button
              key={item.id}
              id={tabId}
              type="button"
              role="tab"
              className={mergeClasses(
                ['cm-ctab__tab'],
                isActive ? 'cm-ctab__tab--active' : undefined,
              )}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => {
                setActiveTabId(item.id);
              }}
            >
              {item.title}
            </button>
          );
        })}
      </div>

      {tabItems.map((item) => {
        const isActive = item.id === effectiveActiveTabId;
        const tabId = `${item.id}-tab`;
        const panelId = `${item.id}-panel`;

        return (
          <div
            key={item.id}
            id={panelId}
            role="tabpanel"
            className="cm-ctab__panel"
            aria-labelledby={tabId}
            hidden={!isActive}
          >
            {item.content}
          </div>
        );
      })}
    </div>
  );
}
