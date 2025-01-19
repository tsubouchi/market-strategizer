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
  },
  {
    title: "4P分析",
    icon: PieChart,
    href: "/analysis/new?type=4P",
  },
  {
    title: "PEST分析",
    icon: TrendingUp,
    href: "/analysis/new?type=PEST",
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="h-screen border-r bg-sidebar">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BarChart3 className="h-6 w-6" />
          <span>戦略分析支援ツール</span>
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
                  "w-full justify-start gap-2",
                  location === link.href && "bg-sidebar-accent"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.title}
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
