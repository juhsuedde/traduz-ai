import { useSyncExternalStore } from "react";

export type ActiveProject = { id: string; name: string; domain: string } | null;

let current: ActiveProject = null;
const listeners = new Set<() => void>();

export function setActiveProject(p: ActiveProject) {
  current = p;
  listeners.forEach((l) => l());
}

export function useActiveProject(): ActiveProject {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => null,
  );
}
