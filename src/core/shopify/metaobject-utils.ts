/**
 * Metaobject Field Parser & Normalizer
 * Provides typed dictionary access to raw Shopify Metaobject field arrays.
 */

export interface RawMetaobjectField {
  key: string;
  value?: string | null;
  reference?: Record<string, unknown> | null;
  references?: {
    nodes?: Record<string, unknown>[];
  } | null;
}

export interface RawMetaobject {
  id?: string;
  handle?: string;
  type?: string;
  fields?: RawMetaobjectField[];
}

export interface ParsedMetaobjectFields {
  getString(key: string, fallback?: string): string;
  getBoolean(key: string, fallback?: boolean): boolean;
  getNumber(key: string, fallback?: number): number;
  getJSON<T = unknown>(key: string, fallback?: T): T;
  getReference<T = Record<string, unknown>>(key: string): T | null;
  getReferences<T = Record<string, unknown>>(key: string): T[];
  rawMap: Map<string, RawMetaobjectField>;
}

export function parseMetaobjectFields(fields: RawMetaobjectField[] = []): ParsedMetaobjectFields {
  const map = new Map<string, RawMetaobjectField>();
  for (const f of fields) {
    if (f.key) map.set(f.key, f);
  }

  return {
    rawMap: map,
    getString(key: string, fallback = ""): string {
      const field = map.get(key);
      return field?.value ?? fallback;
    },
    getBoolean(key: string, fallback = false): boolean {
      const field = map.get(key);
      if (!field?.value) return fallback;
      return field.value === "true" || field.value === "1";
    },
    getNumber(key: string, fallback = 0): number {
      const field = map.get(key);
      if (!field?.value) return fallback;
      const num = Number(field.value);
      return isNaN(num) ? fallback : num;
    },
    getJSON<T = unknown>(key: string, fallback?: T): T {
      const field = map.get(key);
      if (!field?.value) return fallback as T;
      try {
        return JSON.parse(field.value) as T;
      } catch {
        return fallback as T;
      }
    },
    getReference<T = Record<string, unknown>>(key: string): T | null {
      const field = map.get(key);
      return (field?.reference as T) || null;
    },
    getReferences<T = Record<string, unknown>>(key: string): T[] {
      const field = map.get(key);
      return (field?.references?.nodes as T[]) || [];
    },
  };
}

