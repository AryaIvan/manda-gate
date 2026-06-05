import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MANDA Gate",
  description: "Portal Akademik Terpadu MAN 2 Gresik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
