import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as packageEntry from '../src';

interface PackageManifest {
  exports?: Record<string, unknown>;
}

function readProjectFile(...segments: string[]): string {
  return readFileSync(join(process.cwd(), ...segments), 'utf8');
}

function readPackageManifest(): PackageManifest {
  return JSON.parse(readProjectFile('package.json')) as PackageManifest;
}

describe('package entry boundary', () => {
  it('keeps package.json exports scoped to the root entry only', () => {
    const manifest = readPackageManifest();
    const exportMap = manifest.exports ?? {};

    expect(Object.keys(exportMap)).toEqual(['.']);
    expect(exportMap).not.toHaveProperty('./legacy-web');
    expect(exportMap).not.toHaveProperty('./legacyWeb');
  });

  it('does not expose legacy-web symbols from the package entry namespace', () => {
    expect(packageEntry).not.toHaveProperty('legacyWeb');
    expect(Object.keys(packageEntry).some((key) => /legacy-web|legacyWeb/u.test(key))).toBe(false);
  });

  it('does not retain legacy-web source or documentation references', () => {
    const legacyWebSourcePath = join(process.cwd(), 'src', 'legacy-web');
    const readme = readProjectFile('README.md');
    const changelog = readProjectFile('CHANGELOG.md');

    expect(existsSync(legacyWebSourcePath)).toBe(false);
    expect(readme).not.toMatch(/legacy-web|legacyWeb/u);
    expect(changelog).not.toMatch(/legacy-web|legacyWeb/u);
  });
});
