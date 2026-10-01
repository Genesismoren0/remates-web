import type { Metadata } from "next";
import "./globals.css";
import { CarritoProvider } from "./components/CarritoContext";

export const metadata: Metadata = {
  title: "Remates",
  description: "Grandes oportunidades, todos los días.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <CarritoProvider>{children}</CarritoProvider>
      </body>
    </html>
  );
}
