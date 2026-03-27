import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import ThemeRegistry from "./ThemeRegistry";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IAPulse — Tendências em IA",
  description: "Monitoramento de tendências em Inteligência Artificial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={inter.className}>
        <NextTopLoader color="#FDC500" height={3} showSpinner={false} shadow="0 0 10px #FDC500,0 0 5px #FDC500" />
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
