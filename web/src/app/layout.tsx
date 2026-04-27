import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "Exameo",
    template: "%s · Exameo",
  },
  description: "Plateforme moderne de gestion d'examens en ligne.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-zinc-50 antialiased dark:bg-zinc-950">
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 pb-10 text-sm text-zinc-500">
          <p>© 2026 Exameo · MIT · Sprint 0 démo</p>
        </footer>
      </body>
    </html>
  );
}
