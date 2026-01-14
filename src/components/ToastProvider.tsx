"use client";
import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        style: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)", color: "white" },
      }}
    />
  );
}