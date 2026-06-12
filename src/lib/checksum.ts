/**
 * FNV-1a folded to 16 bits — the diegetic "suma de control" stamped at the
 * foot of every archive record. Deterministic per slug, zero dependencies.
 */
export function recordChecksum(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (((h >>> 16) ^ (h & 0xffff)) >>> 0)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0');
}
