import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recibos App",
  description: "Aplicativo para gerenciamento de recibos",
};

// Server Component for Root Layout
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
