import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "EtherWorld",
  description: "Chambre isometrique premium entre Habbo classique et EtherCristal."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
