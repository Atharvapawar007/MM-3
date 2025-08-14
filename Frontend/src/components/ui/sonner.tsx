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
          toast: "group toast border-2 font-medium shadow-lg",
          title: "text-sm font-semibold",
          error: "bg-red-600 text-white border-red-700 shadow-red-200",
          success: "bg-emerald-600 text-white border-emerald-700 shadow-emerald-200",
          info: "bg-blue-600 text-white border-blue-700 shadow-blue-200",
          warning: "bg-amber-600 text-white border-amber-700 shadow-amber-200",
        },
        style: {
          background: 'var(--toast-bg, rgb(37 99 235))',
          color: 'white',
          border: '2px solid var(--toast-border, rgb(29 78 216))',
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
