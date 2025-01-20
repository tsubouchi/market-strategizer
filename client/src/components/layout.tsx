import { Header } from "./header";
import { ReactNode } from "react";
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
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
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar>
          <SidebarContent>
            <div className="px-4 pt-2 pb-4">
              <h2 className="text-xl font-semibold">戦略AIコンパス</h2>
              <p className="text-sm text-muted-foreground mt-1">
                不確実な時代の羅針盤。AIと多段分析でビジネスの方向性を明確化し、次なるアクションプランを見える化します。
              </p>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="ホーム">
                  <Home className="w-4 h-4" />
                  <span>ホーム</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="作成履歴">
                  <History className="w-4 h-4" />
                  <span>作成履歴</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="深層検索エージェント">
                  <Search className="w-4 h-4" />
                  <span>深層検索エージェント</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="競合他社モニタリング">
                  <Eye className="w-4 h-4" />
                  <span>競合他社モニタリング</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="コンセプト生成">
                  <Lightbulb className="w-4 h-4" />
                  <span>コンセプト生成</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="要件書">
                  <FileText className="w-4 h-4" />
                  <span>要件書</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="設定">
                  <Settings className="w-4 h-4" />
                  <span>設定</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-medium mb-2">分析を開始</h3>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="3C分析">
                  <BarChart3 className="w-4 h-4" />
                  <span>3C分析</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="4P分析">
                  <PieChart className="w-4 h-4" />
                  <span>4P分析</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="PEST分析">
                  <TrendingUp className="w-4 h-4" />
                  <span>PEST分析</span>
                </SidebarMenuButton>
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