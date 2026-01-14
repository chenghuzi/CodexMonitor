import { useEffect, useRef, useState } from "react";
import type { DebugEntry } from "../types";
import { searchFiles } from "../services/tauri";

type UseFileSearchOptions = {
  workspaceId: string | null;
  query: string | null;
  limit?: number;
  debounceMs?: number;
  enabled?: boolean;
  onDebug?: (entry: DebugEntry) => void;
};

export function useFileSearch({
  workspaceId,
  query,
  limit = 200,
  debounceMs = 200,
  enabled = true,
  onDebug,
}: UseFileSearchOptions) {
  const [items, setItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query?.trim() ?? "";
    if (!enabled || !workspaceId || trimmed.length < 1) {
      requestId.current += 1;
      setItems([]);
      setIsLoading(false);
      return;
    }

    const currentId = requestId.current + 1;
    requestId.current = currentId;

    const handle = setTimeout(async () => {
      setIsLoading(true);
      onDebug?.({
        id: `${Date.now()}-client-file-search`,
        timestamp: Date.now(),
        source: "client",
        label: "file/search",
        payload: { workspaceId, query: trimmed, limit },
      });
      try {
        const response = await searchFiles(workspaceId, trimmed, limit);
        if (requestId.current !== currentId) {
          return;
        }
        const normalized = Array.isArray(response)
          ? response.map((value) => String(value)).filter(Boolean)
          : [];
        setItems(normalized);
        onDebug?.({
          id: `${Date.now()}-server-file-search`,
          timestamp: Date.now(),
          source: "server",
          label: "file/search response",
          payload: { count: normalized.length },
        });
      } catch (error) {
        if (requestId.current !== currentId) {
          return;
        }
        onDebug?.({
          id: `${Date.now()}-client-file-search-error`,
          timestamp: Date.now(),
          source: "error",
          label: "file/search error",
          payload: error instanceof Error ? error.message : String(error),
        });
        setItems([]);
      } finally {
        if (requestId.current === currentId) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => clearTimeout(handle);
  }, [debounceMs, enabled, limit, onDebug, query, workspaceId]);

  return { items, isLoading };
}
