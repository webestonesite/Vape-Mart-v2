// Mock implementation of next/cache for offline test environment

const recordedTags: string[] = [];
const recordedPaths: string[] = [];

export function revalidateTag(tag: string, _profile?: unknown): void {
  recordedTags.push(tag);
}

export function revalidatePath(path: string, _type?: unknown): void {
  recordedPaths.push(path);
}

export function unstable_cache<T extends (...args: any[]) => any>(fn: T): T {
  return fn;
}

export function getRevalidatedTags(): string[] {
  return [...recordedTags];
}

export function getRevalidatedPaths(): string[] {
  return [...recordedPaths];
}

export function hasRevalidatedTag(tag: string): boolean {
  return recordedTags.includes(tag);
}

export function hasRevalidatedPath(path: string): boolean {
  return recordedPaths.includes(path);
}

export function clearRevalidatedCache(): void {
  recordedTags.length = 0;
  recordedPaths.length = 0;
}
