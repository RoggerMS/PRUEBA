import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { MainLayout } from "../src/components/layout/MainLayout";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
};

export const metadata: Metadata = {
  title: "CRUNEVO - Red Social Educativa Universitaria",
  description: "Plataforma educativa que conecta estudiantes universitarios mediante apuntes, recursos, foros y herramientas de IA con economía virtual Crolars.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50">
        <SessionProvider>
          <Providers>
            <MainLayout>
              {children}
            </MainLayout>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
