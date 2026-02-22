import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Modal,
  MountConsumer,
  MountProvider,
  Popover,
  Select,
  StartButton,
  Taskbar,
  Text,
  useTheme,
} from '../index';
import type { ThemeId } from '../index';
import { DOCK_ZONE_SLOT_MAP, getDockEnabledMap } from './layoutSlots';

const THEME_OPTIONS: readonly { readonly value: ThemeId; readonly label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'win98', label: 'Windows 98' },
  { value: 'winxp', label: 'Windows XP' },
  { value: 'macos', label: 'macOS (Placeholder)' },
  { value: 'material', label: 'Material (Placeholder)' },
];

export const GridMountLayout: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { theme, setTheme } = useTheme();
  const taskbarPosition = 'bottom';
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [edgeVisibility, setEdgeVisibility] = useState({
    top: false,
    right: false,
    bottom: false,
    left: false,
  });
  const dockEnabledMap = useMemo(
    () => getDockEnabledMap(theme.behavior.docking.zones),
    [theme.behavior.docking.zones],
  );

  useEffect(() => {
    const detectEdgeVisibility = () => {
      const hasContent = (slotName: string) => {
        const node = slotRefs.current[slotName];
        return Boolean(node && node.childElementCount > 0);
      };

      setEdgeVisibility({
        top:
          hasContent(DOCK_ZONE_SLOT_MAP['top-left']) ||
          hasContent(DOCK_ZONE_SLOT_MAP.top) ||
          hasContent(DOCK_ZONE_SLOT_MAP['top-right']),
        right:
          hasContent(DOCK_ZONE_SLOT_MAP['top-right']) ||
          hasContent(DOCK_ZONE_SLOT_MAP.right) ||
          hasContent(DOCK_ZONE_SLOT_MAP['bottom-right']),
        bottom:
          hasContent(DOCK_ZONE_SLOT_MAP['bottom-left']) ||
          hasContent(DOCK_ZONE_SLOT_MAP.bottom) ||
          hasContent(DOCK_ZONE_SLOT_MAP['bottom-right']),
        left:
          hasContent(DOCK_ZONE_SLOT_MAP['top-left']) ||
          hasContent(DOCK_ZONE_SLOT_MAP.left) ||
          hasContent(DOCK_ZONE_SLOT_MAP['bottom-left']),
      });
    };

    const slots = Object.values(slotRefs.current).filter(
      (node): node is HTMLDivElement => node !== null,
    );
    if (slots.length === 0) {
      return;
    }

    const observer = new MutationObserver(detectEdgeVisibility);
    for (const slot of slots) {
      observer.observe(slot, { childList: true, subtree: true });
    }

    detectEdgeVisibility();

    return () => observer.disconnect();
  }, []);

  const gridStyle = useMemo(
    () =>
      ({
        '--cm-grid-edge-size': '96px',
        '--cm-grid-top-size': edgeVisibility.top ? 'var(--cm-grid-edge-size)' : '0px',
        '--cm-grid-right-size': edgeVisibility.right ? 'var(--cm-grid-edge-size)' : '0px',
        '--cm-grid-bottom-size': edgeVisibility.bottom ? 'var(--cm-grid-edge-size)' : '0px',
        '--cm-grid-left-size': edgeVisibility.left ? 'var(--cm-grid-edge-size)' : '0px',
      }) as React.CSSProperties,
    [edgeVisibility],
  );

  const bindSlotRef = (slotName: string) => (node: HTMLDivElement | null) => {
    slotRefs.current[slotName] = node;
  };

  return (
    <div className="cm-layer-root">
      <div className="cm-layer cm-layer--base">
        <div className="cm-layer__grid" style={gridStyle}>
          <MountProvider
            name={DOCK_ZONE_SLOT_MAP['top-left']}
            ref={bindSlotRef(DOCK_ZONE_SLOT_MAP['top-left'])}
            className="cm-grid-slot cm-grid-slot--top-left"
            data-slot={DOCK_ZONE_SLOT_MAP['top-left']}
            data-dock-enabled={dockEnabledMap['top-left']}
          />
          <MountProvider
            name={DOCK_ZONE_SLOT_MAP.top}
            ref={bindSlotRef(DOCK_ZONE_SLOT_MAP.top)}
            className="cm-grid-slot cm-grid-slot--top"
            data-slot={DOCK_ZONE_SLOT_MAP.top}
            data-dock-enabled={dockEnabledMap.top}
          />
          <MountProvider
            name={DOCK_ZONE_SLOT_MAP['top-right']}
            ref={bindSlotRef(DOCK_ZONE_SLOT_MAP['top-right'])}
            className="cm-grid-slot cm-grid-slot--top-right"
            data-slot={DOCK_ZONE_SLOT_MAP['top-right']}
            data-dock-enabled={dockEnabledMap['top-right']}
          />

          <MountProvider
            name={DOCK_ZONE_SLOT_MAP.left}
            ref={bindSlotRef(DOCK_ZONE_SLOT_MAP.left)}
            className="cm-grid-slot cm-grid-slot--left"
            data-slot={DOCK_ZONE_SLOT_MAP.left}
            data-dock-enabled={dockEnabledMap.left}
          />
          <MountProvider
            name="layout-center"
            ref={bindSlotRef('layout-center')}
            className="cm-grid-slot cm-grid-slot--center"
            data-slot="layout-center"
          />
          <MountProvider
            name={DOCK_ZONE_SLOT_MAP.right}
            ref={bindSlotRef(DOCK_ZONE_SLOT_MAP.right)}
            className="cm-grid-slot cm-grid-slot--right"
            data-slot={DOCK_ZONE_SLOT_MAP.right}
            data-dock-enabled={dockEnabledMap.right}
          />

          <MountProvider
            name={DOCK_ZONE_SLOT_MAP['bottom-left']}
            ref={bindSlotRef(DOCK_ZONE_SLOT_MAP['bottom-left'])}
            className="cm-grid-slot cm-grid-slot--bottom-left"
            data-slot={DOCK_ZONE_SLOT_MAP['bottom-left']}
            data-dock-enabled={dockEnabledMap['bottom-left']}
          />
          <MountProvider
            name={DOCK_ZONE_SLOT_MAP.bottom}
            ref={bindSlotRef(DOCK_ZONE_SLOT_MAP.bottom)}
            className="cm-grid-slot cm-grid-slot--bottom"
            data-slot={DOCK_ZONE_SLOT_MAP.bottom}
            data-dock-enabled={dockEnabledMap.bottom}
          />
          <MountProvider
            name={DOCK_ZONE_SLOT_MAP['bottom-right']}
            ref={bindSlotRef(DOCK_ZONE_SLOT_MAP['bottom-right'])}
            className="cm-grid-slot cm-grid-slot--bottom-right"
            data-slot={DOCK_ZONE_SLOT_MAP['bottom-right']}
            data-dock-enabled={dockEnabledMap['bottom-right']}
          />
        </div>

        <MountConsumer name={DOCK_ZONE_SLOT_MAP.top}>
          <div className="cm-dock-panel">
            <Text className="cm-dock-panel__title">Grid mount layout ready</Text>
            <Select
              options={THEME_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              value={theme.id}
              onChange={(value) => setTheme(value as ThemeId)}
            />
            <Popover
              content={<Text>Popover mounts to layer-popups and stays above grid.</Text>}
              placement="bottom-start"
            >
              <Button>Open Popover</Button>
            </Popover>
            <Button onClick={() => setShowModal(true)}>Open Modal</Button>
          </div>
        </MountConsumer>
      </div>

      <div className="cm-layer cm-layer--always-top">
        <MountProvider
          name="layer-always-top"
          className="cm-layer__content cm-layer__content--passive"
        />
      </div>

      <div className="cm-layer cm-layer--anchors">
        <MountProvider
          name="layer-anchors"
          className="cm-layer__content cm-layer__content--passive"
        />
        <MountConsumer name="layer-anchors" exclude priority={0}>
          <Taskbar
            startButton={<StartButton />}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              [taskbarPosition]: 0,
            }}
          >
            <Button style={{ minWidth: 180 }}>Grid Mount Provider</Button>
          </Taskbar>
        </MountConsumer>
      </div>

      <div className="cm-layer cm-layer--popups">
        <MountProvider
          name="layer-popups"
          className="cm-layer__content cm-layer__content--passive"
        />
      </div>

      <Modal
        title="Mount Layer Check"
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        style={{ width: 320 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Text>
            Modal is mounted through <code>layer-popups</code> and should render above the 3x3 grid.
          </Text>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GridMountLayout;
