import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  ListChecks,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  Lightbulb,
  Search,
  FileText,
  Eye,
} from "lucide-react";

const sidebarLinks = [
  {
    title: "ホーム",
    icon: Home,
    href: "/",
  },
  {
    title: "作成履歴",
    icon: ListChecks,
    href: "/dashboard",
  },
  {
    title: "深層検索",
    icon: Search,
    href: "/deep-search",
  },
  {
    title: "競合他社モニタリング",
    icon: Eye,
    href: "/competitor-monitoring",
  },
  {
    title: "コンセプト生成",
    icon: Lightbulb,
    href: "/concept-generator",
  },
  {
    title: "要件書",
    icon: FileText,
    href: "/concepts",
  },
  {
    title: "設定",
    icon: Settings,
    href: "/settings",
  },
];

const analysisLinks = [
  {
    title: "3C分析",
    icon: BarChart3,
    href: "/analysis/new?type=3C",
    description: "企業・顧客・競合の視点から戦略を立案（深層検索対応）",
  },
  {
    title: "4P分析",
    icon: PieChart,
    href: "/analysis/new?type=4P",
    description: "マーケティングミックスを体系的に分析（深層検索対応）",
  },
  {
    title: "PEST分析",
    icon: TrendingUp,
    href: "/analysis/new?type=PEST",
    description: "マクロ環境から事業機会とリスクを把握（深層検索対応）",
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="h-screen border-r bg-sidebar">
      <div className="flex h-24 flex-col justify-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <BarChart3 className="h-6 w-6" />
          <div>
            <div className="text-lg">戦略AIコンパス</div>
            <div className="text-xs text-muted-foreground">不確実な時代の羅針盤。AIが導く最適解</div>
          </div>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-4">
          {sidebarLinks.map((link) => (
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
          {analysisLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 flex-col items-start",
                  location === link.href && "bg-sidebar-accent"
                )}
              >
                <div className="flex items-center gap-2">
                  <link.icon className="h-4 w-4" />
                  {link.title}
                </div>
                {link.description && (
                  <span className="text-xs text-muted-foreground ml-6">
                    {link.description}
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}