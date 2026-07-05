import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import MainContainer from "@/components/layout/MainContainer";
import { AuditProvider } from "@/context/AuditContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "ISO 27001 Audit System",
  description: "Sistema profesional de auditoría ISO 27001",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <Navbar />
          <AuditProvider>
            <MainContainer>
              {children}
            </MainContainer>
          </AuditProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

