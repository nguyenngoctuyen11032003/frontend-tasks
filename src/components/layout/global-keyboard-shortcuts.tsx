"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { toast } from "@/lib/toast";

export function GlobalKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [gPressed, setGPressed] = useState(false);
  const [vPressed, setVPressed] = useState(false);

  // Reset key combination states after timeout
  useEffect(() => {
    if (gPressed) {
      const timer = setTimeout(() => setGPressed(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [gPressed]);

  useEffect(() => {
    if (vPressed) {
      const timer = setTimeout(() => setVPressed(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [vPressed]);

  // Navigation shortcuts (G + key)
  useKeyboardShortcut([
    {
      key: "g",
      handler: () => setGPressed(true),
      description: "Start navigation shortcut",
    },
    {
      key: "d",
      handler: () => {
        if (gPressed) {
          router.push("/dashboard");
          setGPressed(false);
          toast.info("Điều hướng đến Dashboard");
        }
      },
      description: "Go to dashboard",
    },
    {
      key: "t",
      handler: () => {
        if (gPressed) {
          router.push("/tasks");
          setGPressed(false);
          toast.info("Điều hướng đến Công việc");
        }
      },
      description: "Go to tasks",
    },
    {
      key: "p",
      handler: () => {
        if (gPressed) {
          router.push("/projects");
          setGPressed(false);
          toast.info("Điều hướng đến Dự án");
        }
      },
      description: "Go to projects",
    },
    {
      key: "n",
      handler: () => {
        if (gPressed) {
          router.push("/notes");
          setGPressed(false);
          toast.info("Điều hướng đến Ghi chú");
        }
      },
      description: "Go to notes",
    },
    {
      key: "c",
      handler: () => {
        if (gPressed) {
          router.push("/chat");
          setGPressed(false);
          toast.info("Điều hướng đến Chat");
        }
      },
      description: "Go to chat",
    },
    {
      key: "m",
      handler: () => {
        if (gPressed) {
          router.push("/team");
          setGPressed(false);
          toast.info("Điều hướng đến Nhóm");
        }
      },
      description: "Go to team",
    },
    {
      key: "s",
      handler: () => {
        if (gPressed) {
          router.push("/settings");
          setGPressed(false);
          toast.info("Điều hướng đến Cài đặt");
        }
      },
      description: "Go to settings",
    },
  ]);

  // View mode shortcuts (V + key) - only on tasks/projects pages
  useKeyboardShortcut([
    {
      key: "v",
      handler: () => {
        if (pathname?.includes("/tasks") || pathname?.includes("/projects")) {
          setVPressed(true);
        }
      },
      description: "Start view mode shortcut",
    },
  ]);

  // Search shortcut (/)
  useKeyboardShortcut({
    key: "/",
    handler: (e) => {
      e.preventDefault();
      // Focus search input if it exists
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        toast.info("Chế độ tìm kiếm");
      }
    },
    description: "Focus search",
  });

  // Escape to close modals/panels
  useKeyboardShortcut({
    key: "Escape",
    handler: () => {
      // Close any open dialogs or sheets
      const closeButtons = document.querySelectorAll('[aria-label="Close"]');
      if (closeButtons.length > 0) {
        (closeButtons[0] as HTMLButtonElement).click();
      }
    },
    description: "Close modals",
    preventDefault: false,
  });

  return null; // This component doesn't render anything
}
