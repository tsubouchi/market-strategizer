import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">戦略分析</h1>
          <p className="text-muted-foreground">
            AIを活用した戦略分析で、ビジネスの方向性を明確に
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {analysisTypes.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <type.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{type.title}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
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
                <Button className="w-full mt-auto" asChild>
                  <Link href={`/analysis/new/${type.id.toLowerCase()}`}>
                    この分析を開始
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}