"use client";

import { useEffect, useCallback } from "react";

type KeyboardEventHandler = (event: KeyboardEvent) => void;

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(config: ShortcutConfig | ShortcutConfig[]) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Safety check for event and event.key
      if (!event || !event.key) return

      const configs = Array.isArray(config) ? config : [config];

      for (const shortcut of configs) {
        const {
          key,
          ctrl = false,
          shift = false,
          alt = false,
          meta = false,
          handler,
          preventDefault = true,
        } = shortcut;

        // Safety check for key parameter
        if (!key) continue;

        // Check if the pressed key matches
        const keyMatch = event.key.toLowerCase() === key.toLowerCase();
        const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
        const altMatch = alt ? event.altKey : !event.altKey;
        const metaMatch = meta ? event.metaKey : true;

        // Don't trigger if user is typing in an input
        const target = event.target as HTMLElement;
        const isInput =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;

        // Allow certain shortcuts even in inputs (like Escape)
        const allowInInput = key === "Escape" || (ctrl && key === "k");

        if (
          keyMatch &&
          ctrlMatch &&
          shiftMatch &&
          altMatch &&
          metaMatch &&
          (!isInput || allowInInput)
        ) {
          if (preventDefault) {
            event.preventDefault();
          }
          handler(event);
          break;
        }
      }
    },
    [config]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);
}

// Helper hook for single shortcut
export function useShortcut(
  key: string,
  handler: (event: KeyboardEvent) => void,
  options?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    preventDefault?: boolean;
  }
) {
  useKeyboardShortcut({
    key,
    handler,
    ...options,
  });
}
