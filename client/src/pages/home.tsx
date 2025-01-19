import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BarChart3, PieChart, TrendingUp, ArrowRight } from "lucide-react";

export default function Home() {
  const analysisTypes = [
    {
      id: "3C",
      title: "3C分析",
      description: "企業・顧客・競合の視点から戦略を立案",
      icon: BarChart3,
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
      description: "マーケティングミックスを体系的に分析",
      icon: PieChart,
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
      description: "マクロ環境から事業機会とリスクを把握",
      icon: TrendingUp,
      details: [
        "政治的要因（Political）：規制や政策の影響を予測",
        "経済的要因（Economic）：市場環境の変化を分析",
        "社会的要因（Social）：価値観や人口動態を把握",
        "技術的要因（Technological）：技術革新の影響を評価"
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ビジネス戦略分析支援ツール
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            AIを活用した多段階分析で、より深い洞察と具体的なアクションプランを導き出します
          </p>
        </div>

        {/* Analysis Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {analysisTypes.map((type) => (
            <Card key={type.id} className="transition-all hover:shadow-lg h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <type.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-2">{type.title}</CardTitle>
                <CardDescription className="text-base">
                  {type.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 mb-6 flex-1">
                  {type.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="block w-1 h-1 mt-2 rounded-full bg-primary/50" />
                      {detail}
                    </li>
                  ))}
                </ul>
                <Link href={`/analysis/new?type=${type.id}`}>
                  <Button className="w-full mt-auto">
                    この分析を開始
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-12">特徴</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="mb-4 text-primary">
                <BarChart3 className="w-10 h-10 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ステップ形式の分析</h3>
              <p className="text-muted-foreground">
                各分析を段階的に進め、漏れのない戦略立案をサポート
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4 text-primary">
                <PieChart className="w-10 h-10 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">多段階AI分析</h3>
              <p className="text-muted-foreground">
                初期分析から深堀分析、具体的な提案まで、AIが段階的にサポート
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4 text-primary">
                <TrendingUp className="w-10 h-10 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">根拠に基づく分析</h3>
              <p className="text-muted-foreground">
                参考URLや関連資料を添付し、より具体的な分析の根拠を残せます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}