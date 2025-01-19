import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BarChart3, PieChart, TrendingUp } from "lucide-react";

export default function Home() {
  const analysisTypes = [
    {
      id: "3c",
      title: "3C分析",
      description: "自社・顧客・競合他社の観点から戦略を導き出す",
      icon: BarChart3,
      details: [
        "Company（自社）の強みと弱みを明確化",
        "Customer（顧客）のニーズと行動を理解",
        "Competitor（競合）との差別化要因を分析",
        "3つの要素を総合的に分析し、競争優位性を確立"
      ],
    },
    {
      id: "4p",
      title: "4P分析",
      description: "マーケティングミックスの4つの要素を分析",
      icon: PieChart,
      details: [
        "Product（製品）の特徴と価値提案を評価",
        "Price（価格）の戦略的な設定と分析",
        "Place（流通）のチャネル選択と最適化",
        "Promotion（販促）の効果的な手法の検討"
      ],
    },
    {
      id: "pest",
      title: "PEST分析",
      description: "マクロ環境要因から事業機会とリスクを特定",
      icon: TrendingUp,
      details: [
        "Political（政治的要因）：法規制や政策の影響を分析",
        "Economic（経済的要因）：景気動向や市場環境を評価",
        "Social（社会的要因）：人口動態や価値観の変化を把握",
        "Technological（技術的要因）：技術革新の影響を予測"
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ビジネス戦略分析ツール
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            AI搭載の分析支援で、より深い洞察とアクションにつながる戦略立案をサポートします
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/analysis/new">
              <Button size="lg" className="gap-2">
                <GraduationCap className="w-5 h-5" />
                分析を始める
              </Button>
            </Link>
          </div>
        </div>

        {/* Analysis Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {analysisTypes.map((type) => (
            <Card key={type.id} className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <type.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-2">{type.title}</CardTitle>
                <CardDescription className="text-base">
                  {type.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {type.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="block w-1 h-1 mt-2 rounded-full bg-primary/50" />
                      {detail}
                    </li>
                  ))}
                </ul>
                <Link href={`/analysis/${type.id}`} className="block mt-6">
                  <Button variant="outline" className="w-full">
                    この分析を選択
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-12">特徴</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="mb-4 text-primary">
                <BarChart3 className="w-10 h-10 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">多段階AI分析</h3>
              <p className="text-muted-foreground">
                初期分析から深堀分析、具体的な提案まで、AIが段階的に戦略立案をサポート
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4 text-primary">
                <PieChart className="w-10 h-10 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">分析履歴の管理</h3>
              <p className="text-muted-foreground">
                過去の分析結果を保存・管理し、戦略の変遷を追跡できます
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4 text-primary">
                <TrendingUp className="w-10 h-10 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">参考資料の添付</h3>
              <p className="text-muted-foreground">
                URLや関連資料を添付し、より具体的な分析の根拠を残せます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}