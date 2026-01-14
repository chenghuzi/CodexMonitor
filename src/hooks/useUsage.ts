import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { getUsageSnapshot, refreshUsageSnapshot } from "../services/tauri";
import type { AppSettings, UsageSnapshot } from "../types";

export function useUsage(settings: AppSettings) {
  const [snapshot, setSnapshot] = useState<UsageSnapshot | null>(null);

  useEffect(() => {
    let mounted = true;
    getUsageSnapshot()
      .then((data) => {
        if (mounted) {
          setSnapshot(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setSnapshot(null);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = listen<UsageSnapshot>("usage-updated", (event) => {
      setSnapshot(event.payload);
    });
    return () => {
      subscription.then((unlisten) => unlisten());
    };
  }, []);

  useEffect(() => {
    if (!settings.usagePollingEnabled) {
      return;
    }
    refreshUsageSnapshot()
      .then((data) => setSnapshot(data))
      .catch(() => undefined);
  }, [settings.usagePollingEnabled, settings.usagePollingIntervalMinutes]);

  return { snapshot };
}
