"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast border-2 font-medium",
          title: "text-sm",
          error: "bg-red-500 text-white border-red-600",
          success: "bg-green-500 text-white border-green-600",
          info: "bg-blue-500 text-white border-blue-600",
          warning: "bg-yellow-500 text-white border-yellow-600",
        },
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      } as React.CSSProperties}
      {...props}
    />
  );
};

export { Toaster };
