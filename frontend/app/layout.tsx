import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { AuthSync } from "@/components/AuthSync";
import { BackendHealthPrefetch } from "@/components/BackendHealthPrefetch";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Career Copilot | Built with Gemma 4",
  description:
    "Premium AI career mentor powered by Gemma 4 (gemma-4-26b-a4b-it) — adaptive assessments, roadmaps, resumes, and interviews.",
  icons: {
    icon: "/logo-career-copilot.png",
    apple: "/logo-career-copilot.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AuthProvider>
          <ToastProvider>
            <AuthSync />
            <BackendHealthPrefetch />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
