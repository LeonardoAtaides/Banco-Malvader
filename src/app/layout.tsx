// app/layout.tsx
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Montserrat global
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // você pode adicionar os pesos que usar
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Malvader Bank",
  description: "Banco digital desenvolvido em Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${montserrat.variable} antialiased font-sans bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
