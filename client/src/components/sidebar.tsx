import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  Search,
  Eye,
  Lightbulb,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  Menu,
} from "lucide-react";

const mainLinks = [
  {
    title: "ホーム",
    icon: Home,
    href: "/",
  },
  {
    title: "ダッシュボード",
    icon: BarChart3,
    href: "/dashboard",
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
    id: "3C",
    title: "3C分析",
    icon: BarChart3,
    href: "/analysis/new/3c",
    description: "企業・顧客・競合の視点から戦略を立案",
    details: [
      "自社（Company）の強みと経営資源を分析",
      "顧客（Customer）のニーズと行動を理解",
      "競合（Competitor）との差別化要因を特定",
      "3つの要素を統合し、競争優位性を確立"
    ],
  },
  {
    id: "4P",
    title: "4P分析",
    icon: PieChart,
    href: "/analysis/new/4p",
    description: "マーケティングミックスを体系的に分析",
    details: [
      "製品（Product）の特徴と価値を明確化",
      "価格（Price）の戦略的な設定を検討",
      "流通（Place）のチャネル戦略を最適化",
      "プロモーション（Promotion）の効果を向上"
    ],
  },
  {
    id: "PEST",
    title: "PEST分析",
    icon: TrendingUp,
    href: "/analysis/new/pest",
    description: "マクロ環境から事業機会とリスクを把握",
    details: [
      "政治的要因（Political）：規制や政策の影響を予測",
      "経済的要因（Economic）：市場環境の変化を分析",
      "社会的要因（Social）：価値観や人口動態を把握",
      "技術的要因（Technological）：技術革新の影響を評価"
    ],
  },
];

const SidebarContent = () => {
  const [location] = useLocation();

  return (
    <div className="h-full flex flex-col">
      <div className="flex h-24 flex-col justify-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <BarChart3 className="h-6 w-6" />
          <div>
            <div className="text-lg">戦略AIコンパス</div>
            <div className="text-xs text-muted-foreground">不確実な時代の羅針盤。AIが導く最適解</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 py-4">
        <div className="grid gap-1 px-4">
          {mainLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  location === link.href && "bg-sidebar-accent"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.title}
              </Button>
            </Link>
          ))}
          <div className="my-4 border-t" />
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
            分析を開始
          </p>
          {analysisTypes.map((analysis) => (
            <div key={analysis.href} className="mb-4">
              <Link href={analysis.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start flex-col items-start gap-2 h-auto py-4",
                    location === analysis.href && "bg-sidebar-accent"
                  )}
                >
                  <div className="flex items-center gap-2 w-full">
                    <analysis.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{analysis.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground text-left">
                    {analysis.description}
                  </div>
                  <ul className="text-xs text-muted-foreground list-disc list-inside mt-2 text-left">
                    {analysis.details.map((detail, index) => (
                      <li key={index} className="ml-2">{detail}</li>
                    ))}
                  </ul>
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default function Sidebar() {
  return (
    <>
      {/* デスクトップサイドバー */}
      <div className="hidden md:block h-screen w-80 border-r bg-background overflow-y-auto">
        <SidebarContent />
      </div>

      {/* モバイルハンバーガーメニュー */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-[400px] p-0 bg-background border-r shadow-lg">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}