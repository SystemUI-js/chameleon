import type { DockZoneDef, DockZoneId } from '../theme/types';

export const CENTER_SLOT_NAME = 'layout-center';

export const DOCK_ZONE_SLOT_MAP: Readonly<Record<DockZoneId, string>> = {
  'top-left': 'layout-top-left',
  top: 'layout-top',
  'top-right': 'layout-top-right',
  left: 'layout-left',
  right: 'layout-right',
  'bottom-left': 'layout-bottom-left',
  bottom: 'layout-bottom',
  'bottom-right': 'layout-bottom-right',
};

export const GRID_SLOT_NAMES: readonly string[] = [
  DOCK_ZONE_SLOT_MAP['top-left'],
  DOCK_ZONE_SLOT_MAP.top,
  DOCK_ZONE_SLOT_MAP['top-right'],
  DOCK_ZONE_SLOT_MAP.left,
  CENTER_SLOT_NAME,
  DOCK_ZONE_SLOT_MAP.right,
  DOCK_ZONE_SLOT_MAP['bottom-left'],
  DOCK_ZONE_SLOT_MAP.bottom,
  DOCK_ZONE_SLOT_MAP['bottom-right'],
];

export function getDockEnabledMap(
  zones: readonly DockZoneDef[],
): Readonly<Record<DockZoneId, boolean>> {
  const enabledMap: Record<DockZoneId, boolean> = {
    'top-left': false,
    top: false,
    'top-right': false,
    left: false,
    right: false,
    'bottom-left': false,
    bottom: false,
    'bottom-right': false,
  };

  for (const zone of zones) {
    enabledMap[zone.id] = zone.enabled ?? true;
  }

  return enabledMap;
}
