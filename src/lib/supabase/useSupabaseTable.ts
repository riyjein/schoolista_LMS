import { useEffect, useState } from "react";
import { getSupabaseClient, hasSupabaseConfig } from "./client";

export interface UseSupabaseTableOptions<T> {
  table: string;
  fallback: T[];
  orderBy?: string;
  ascending?: boolean;
  select?: string;
  useFallbackWhenEmpty?: boolean;
}

export interface UseSupabaseTableResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function toCamelCaseKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

function camelizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => camelizeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        toCamelCaseKey(key),
        camelizeValue(nested),
      ]),
    );
  }

  return value;
}

/**
 * Central table reader for the hook layer.
 * Put Supabase CRUD here first, then keep hook code focused on UI composition.
 */
export function useSupabaseTable<T extends object>(
  options: UseSupabaseTableOptions<T>,
): UseSupabaseTableResult<T> {
  const {
    table,
    fallback,
    orderBy,
    ascending = true,
    select = "*",
    useFallbackWhenEmpty = true,
  } = options;
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState<boolean>(hasSupabaseConfig());
  const [error, setError] = useState<string | null>(null);

  const refresh = async (): Promise<void> => {
    const client = getSupabaseClient();
    if (!client) {
      setData(fallback);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let query = client.from(table).select(select);
    if (orderBy) query = query.order(orderBy, { ascending });

    const { data: rows, error: fetchError } = await query;
    if (fetchError) {
      setError(fetchError.message);
      setData(fallback);
    } else {
      const normalizedRows = (rows ?? []).map((row) => camelizeValue(row)) as T[];
      if (useFallbackWhenEmpty && normalizedRows.length === 0 && fallback.length > 0) {
        setData(fallback);
      } else {
        setData(normalizedRows);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, orderBy, ascending, select]);

  return { data, loading, error, refresh };
}
