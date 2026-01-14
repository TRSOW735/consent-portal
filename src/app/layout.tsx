import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "sonner";

export const metadata = {
  title: "Consent Portal",
  description: "Solana-native payments + verified receipts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="app-bg">
        <Toaster richColors position="top-right" />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}