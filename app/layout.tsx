import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Nimbus - Review Analytics Dashboard",
  description: "AI-powered customer review analytics for Frontier Communications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-dark-bg">
        <ThemeProvider>
          <ErrorBoundary>
            <div className="flex h-screen bg-dark-bg">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-dark-bg relative">
                <div className="absolute top-4 right-8 z-50">
                  <ThemeToggle />
                </div>
                {children}
              </main>
            </div>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}

