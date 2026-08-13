"use client";

import { useCallback, useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";

export function useUnsavedChanges(enabled = true) {
  const dirtyRef = useRef(false);
  const markDirty = useCallback(() => {
    if (enabled) dirtyRef.current = true;
  }, [enabled]);
  const markClean = useCallback(() => {
    dirtyRef.current = false;
  }, []);
  const markDirtyOnButtonClick = useCallback(
    (event: ReactMouseEvent<HTMLFormElement>) => {
      if (
        event.target instanceof Element &&
        event.target.closest('button[type="button"]')
      ) {
        markDirty();
      }
    },
    [markDirty],
  );

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    function beforeNavigation(event: MouseEvent) {
      if (!dirtyRef.current || event.defaultPrevented) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      if (!window.confirm("Discard your unsaved changes?")) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        dirtyRef.current = false;
      }
    }

    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", beforeNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", beforeNavigation, true);
    };
  }, []);

  return { markDirty, markClean, markDirtyOnButtonClick };
}
