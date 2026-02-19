import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import MainContainer from "@/components/layout/MainContainer";
import { AuditProvider } from "@/context/AuditContext";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
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

