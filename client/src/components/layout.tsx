import { Header } from "./header";
import { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import {
  Home,
  Search,
  Eye,
  Lightbulb,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}