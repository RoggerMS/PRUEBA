import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { MainLayout } from "@/components/layout/MainLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CRUNEVO - Red Social Educativa Universitaria",
  description: "Plataforma educativa que conecta estudiantes universitarios mediante apuntes, recursos, foros y herramientas de IA con economía virtual Crolars.",
  keywords: "educación, universidad, apuntes, foro, estudiantes, crolars, red social educativa",
  authors: [{ name: "CRUNEVO Team" }],
  creator: "CRUNEVO",
  publisher: "CRUNEVO",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#7c3aed",
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://crunevo.com",
    title: "CRUNEVO - Red Social Educativa Universitaria",
    description: "Conecta con estudiantes, comparte apuntes y gana Crolars en la mejor plataforma educativa universitaria.",
    siteName: "CRUNEVO",
  },
  twitter: {
    card: "summary_large_image",
    title: "CRUNEVO - Red Social Educativa Universitaria",
    description: "Conecta con estudiantes, comparte apuntes y gana Crolars en la mejor plataforma educativa universitaria.",
    creator: "@crunevo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50">
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
