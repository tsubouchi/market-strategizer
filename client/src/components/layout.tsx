import { Header } from "./header";
import { ReactNode } from "react";
import { Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Home,
  Search,
  Eye,
  Lightbulb,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
} from "lucide-react";

const mainLinks = [
  {
    title: "ホーム",
    icon: Home,
    href: "/",
  },
  {
    title: "深層検索エージェント",
    icon: Search,
    href: "/search",
  },
  {
    title: "競合他社モニタリング",
    icon: Eye,
    href: "/monitoring",
  },
  {
    title: "コンセプト生成",
    icon: Lightbulb,
    href: "/concept",
  },
  {
    title: "設定",
    icon: Settings,
    href: "/settings",
  },
];

const analysisTypes = [
  {
    title: "3C分析",
    icon: BarChart3,
    href: "/analysis/new/3c",
  },
  {
    title: "4P分析",
    icon: PieChart,
    href: "/analysis/new/4p",
  },
  {
    title: "PEST分析",
    icon: TrendingUp,
    href: "/analysis/new/pest",
  },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar>
            <SidebarHeader>
              <Link href="/" className="flex items-center gap-2 font-bold pt-8">
                <BarChart3 className="h-6 w-6" />
                <div>
                  <div className="text-lg">戦略AIコンパス</div>
                </div>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {mainLinks.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <Link href={link.href}>
                      <SidebarMenuButton asChild tooltip={link.title}>
                        <div>
                          <link.icon className="h-4 w-4" />
                          <span>{link.title}</span>
                        </div>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem className="mt-4">
                  <div className="px-2 text-xs font-medium text-muted-foreground">
                    分析を開始
                  </div>
                </SidebarMenuItem>
                {analysisTypes.map((analysis) => (
                  <SidebarMenuItem key={analysis.href}>
                    <Link href={analysis.href}>
                      <SidebarMenuButton asChild tooltip={analysis.title}>
                        <div>
                          <analysis.icon className="h-4 w-4" />
                          <span>{analysis.title}</span>
                        </div>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}