/**
 * Utility for robust version comparisons supporting both standard semver (e.g. "4.2.1")
 * and simple dot-separated numbers (e.g. "4.2").
 */

export function parseVersionParts(version: string): number[] {
  if (!version) return [];
  // Strip leading 'v' if present
  const clean = version.trim().replace(/^v/i, '');
  return clean.split('.').map((part) => {
    const num = parseInt(part, 10);
    return isNaN(num) ? 0 : num;
  });
}

export function compareVersions(v1: string, v2: string): number {
  const parts1 = parseVersionParts(v1);
  const parts2 = parseVersionParts(v2);
  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

export function isVersionInRange(
  version: string,
  minVersion?: string | null,
  maxVersion?: string | null,
): boolean {
  if (!version) return true;
  if (!minVersion && !maxVersion) return true;

  if (minVersion && compareVersions(version, minVersion) < 0) {
    return false;
  }
  if (maxVersion && compareVersions(version, maxVersion) > 0) {
    return false;
  }
  return true;
}
