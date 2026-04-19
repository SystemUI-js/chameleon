import * as PackageEntry from '../src';
import * as LegacyWebEntry from '../src/legacy-web';
import * as ReactNativeEntry from '../src/react-native-multi-drag';

describe('package entry contract', () => {
  it('keeps legacy web exports behind an explicit namespace', () => {
    expect(PackageEntry.legacyWeb.CButton).toBe(LegacyWebEntry.CButton);
    expect(PackageEntry.legacyWeb.CWindowTitle).toBe(LegacyWebEntry.CWindowTitle);
    expect('CButton' in PackageEntry).toBe(false);
    expect('CWindow' in PackageEntry).toBe(false);
    expect('Theme' in PackageEntry).toBe(false);
    expect(typeof PackageEntry.defaultThemeDefinition).toBe('object');
  });

  it('requires the explicit react-native entry for native-first drag APIs', () => {
    expect('createReactNativeMultiDrag' in PackageEntry).toBe(false);
    expect(typeof ReactNativeEntry.createReactNativeMultiDrag).toBe('function');
    expect(typeof ReactNativeEntry.useReactNativeMultiDrag).toBe('function');
  });
});
