// src/app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "JSON RPG Arcade",
  description: "Upload and play custom JSON-driven 2D RPG dungeons.",
};

function NavbarSkeleton() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 text-zinc-100">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <span className="text-lg font-bold tracking-tight text-emerald-400">
          ⚔️ JSON RPG Arcade
        </span>
        <div className="h-7 w-32 animate-pulse rounded bg-zinc-800" />
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
