import { Header } from "./header";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}