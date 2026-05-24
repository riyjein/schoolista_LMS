import { getSupabaseClient } from './client';

function toSnakeCaseKey(key: string): string {
  return key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}

function transformForWrite(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => transformForWrite(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, nested]) => nested !== undefined)
        .map(([key, nested]) => [toSnakeCaseKey(key), transformForWrite(nested)]),
    );
  }

  return value;
}

export async function insertRow<T>(table: string, payload: T): Promise<T | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from(table)
    .insert(transformForWrite(payload) as never)
    .select()
    .single();
  if (error) throw error;
  return data as T;
}

export async function updateRow<T>(table: string, idColumn: string, id: string, payload: Partial<T>): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client
    .from(table)
    .update(transformForWrite(payload) as never)
    .eq(idColumn, id);
  if (error) throw error;
}

export async function deleteRow(table: string, idColumn: string, id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from(table).delete().eq(idColumn, id);
  if (error) throw error;
}
