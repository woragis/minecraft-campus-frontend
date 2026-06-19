import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusWorld",
  description: "Plataforma social universitária sobre Minecraft",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="site-header">
          <nav>
            <Link href="/">Início</Link>
            <Link href="/conta">Conta</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
