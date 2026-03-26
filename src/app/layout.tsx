import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IAPulse",
  description: "Monitoramento de tendências em Inteligência Artificial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
