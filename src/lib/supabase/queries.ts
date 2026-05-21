import { getSupabaseClient } from './client';

export async function insertRow<T>(table: string, payload: T): Promise<T | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.from(table).insert(payload as never).select().single();
  if (error) throw error;
  return data as T;
}

export async function updateRow<T>(table: string, idColumn: string, id: string, payload: Partial<T>): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from(table).update(payload as never).eq(idColumn, id);
  if (error) throw error;
}

export async function deleteRow(table: string, idColumn: string, id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.from(table).delete().eq(idColumn, id);
  if (error) throw error;
}

