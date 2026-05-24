import { useCallback, useEffect, useState } from "react";

import { getSupabaseClient, hasSupabaseConfig } from "./client";
import { deleteRow, insertRow, updateRow } from "./queries";

export interface UseSupabaseCrudTableOptions<T extends { id: string }> {
  table: string;
  fallback: T[];
  orderBy?: string;
  ascending?: boolean;
  select?: string;
  idColumn?: string;
  useFallbackWhenEmpty?: boolean;
}

export interface UseSupabaseCrudTableResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createRow: (payload: Partial<T>) => Promise<T | null>;
  updateRowById: (id: string, payload: Partial<T>) => Promise<void>;
  deleteRowById: (id: string) => Promise<void>;
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

function createLocalId(prefix: string): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

function ensureLocalRecord<T extends { id: string }>(
  payload: Partial<T>,
  idColumn: string,
  prefix: string,
): T {
  const record = { ...payload } as Record<string, unknown>;
  if (!record[idColumn]) {
    record[idColumn] = createLocalId(prefix);
  }
  return record as T;
}

export function useSupabaseCrudTable<T extends { id: string }>(
  options: UseSupabaseCrudTableOptions<T>,
): UseSupabaseCrudTableResult<T> {
  const {
    table,
    fallback,
    orderBy,
    ascending = true,
    select = "*",
    idColumn = "id",
    useFallbackWhenEmpty = true,
  } = options;

  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState<boolean>(hasSupabaseConfig());
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
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
      const normalizedRows = (rows ?? []).map((row) =>
        camelizeValue(row),
      ) as T[];
      if (
        useFallbackWhenEmpty &&
        normalizedRows.length === 0 &&
        fallback.length > 0
      ) {
        setData(fallback);
      } else {
        setData(normalizedRows);
      }
    }

    setLoading(false);
  }, [ascending, orderBy, select, table, useFallbackWhenEmpty]);

  const createRow = useCallback(
    async (payload: Partial<T>): Promise<T | null> => {
      const client = getSupabaseClient();
      const record = ensureLocalRecord<T>(payload, idColumn, table.slice(0, 8));

      if (!client) {
        setData((current) => [record, ...current]);
        return record;
      }

      const inserted = await insertRow<T>(table, record as T);
      await refresh();
      return inserted;
    },
    [idColumn, refresh, table],
  );

  const updateRowById = useCallback(
    async (id: string, payload: Partial<T>): Promise<void> => {
      const client = getSupabaseClient();

      if (!client) {
        setData((current) =>
          current.map((row) =>
            String((row as Record<string, unknown>)[idColumn]) === id
              ? ({ ...row, ...payload } as T)
              : row,
          ),
        );
        return;
      }

      await updateRow<T>(table, idColumn, id, payload);
      await refresh();
    },
    [idColumn, refresh, table],
  );

  const deleteRowById = useCallback(
    async (id: string): Promise<void> => {
      const client = getSupabaseClient();

      if (!client) {
        setData((current) =>
          current.filter(
            (row) => String((row as Record<string, unknown>)[idColumn]) !== id,
          ),
        );
        return;
      }

      await deleteRow(table, idColumn, id);
      await refresh();
    },
    [idColumn, refresh, table],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    createRow,
    updateRowById,
    deleteRowById,
  };
}
