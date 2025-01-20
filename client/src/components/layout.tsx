import { Header } from "./header";
import { ReactNode } from "react";
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import {
  Home,
  History,
  Search,
  Eye,
  Lightbulb,
  FileText,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
          <SidebarContent className="pt-14"> {/* Add top padding to avoid header overlap */}
            <div className="px-4 pt-4 pb-4">
              <h2 className="text-xl font-semibold">戦略AIコンパス</h2>
              <p className="text-sm text-muted-foreground mt-1">
                不確実な時代の羅針盤。AIが導く羅針盤
              </p>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/">
                  <SidebarMenuButton tooltip="ホーム" isActive={location === "/"}>
                    <Home className="w-4 h-4" />
                    <span>ホーム</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/history">
                  <SidebarMenuButton tooltip="作成履歴" isActive={location === "/history"}>
                    <History className="w-4 h-4" />
                    <span>作成履歴</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/search">
                  <SidebarMenuButton tooltip="深層検索エージェント" isActive={location === "/search"}>
                    <Search className="w-4 h-4" />
                    <span>深層検索エージェント</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/monitoring">
                  <SidebarMenuButton tooltip="競合他社モニタリング" isActive={location === "/monitoring"}>
                    <Eye className="w-4 h-4" />
                    <span>競合他社モニタリング</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/concept">
                  <SidebarMenuButton tooltip="コンセプト生成" isActive={location === "/concept"}>
                    <Lightbulb className="w-4 h-4" />
                    <span>コンセプト生成</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/requirements">
                  <SidebarMenuButton tooltip="要件書" isActive={location === "/requirements"}>
                    <FileText className="w-4 h-4" />
                    <span>要件書</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/settings">
                  <SidebarMenuButton tooltip="設定" isActive={location === "/settings"}>
                    <Settings className="w-4 h-4" />
                    <span>設定</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-medium mb-2">分析を開始</h3>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/analysis/3c">
                  <SidebarMenuButton tooltip="3C分析" isActive={location === "/analysis/3c"}>
                    <BarChart3 className="w-4 h-4" />
                    <span>3C分析</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/analysis/4p">
                  <SidebarMenuButton tooltip="4P分析" isActive={location === "/analysis/4p"}>
                    <PieChart className="w-4 h-4" />
                    <span>4P分析</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/analysis/pest">
                  <SidebarMenuButton tooltip="PEST分析" isActive={location === "/analysis/pest"}>
                    <TrendingUp className="w-4 h-4" />
                    <span>PEST分析</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}