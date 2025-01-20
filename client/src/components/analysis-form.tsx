import { useState } from "react";
import { useCreateAnalysis } from "@/hooks/use-analysis";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link as LinkIcon, Paperclip, ArrowLeft, ArrowRight } from "lucide-react";
import { AnalysisPDFViewer } from "./analysis-pdf";
import { Typewriter } from "@/components/ui/typewriter";

export type AnalysisType = "3C" | "4P" | "PEST";

const analysisSteps = {
  "3C": [
    {
      key: "company",
      label: "企業分析（Company）",
      description: "自社の強み・弱み、経営資源、競争優位性について分析します。",
      placeholder: "例：\n・主力製品・サービス\n・技術力や特許\n・人材やノウハウ\n・資金力や設備"
    },
    {
      key: "customer",
      label: "顧客分析（Customer）",
      description: "顧客のニーズ、行動パターン、市場動向について分析します。",
      placeholder: "例：\n・顧客層の特徴\n・購買動機や行動\n・未充足ニーズ\n・市場規模や成長性"
    },
    {
      key: "competitors",
      label: "競合分析（Competitor）",
      description: "競合他社の特徴、強み、市場での位置づけを分析します。",
      placeholder: "例：\n・主要競合企業\n・競合の強み・弱み\n・市場シェア\n・差別化要因"
    }
  ],
  "4P": [
    {
      key: "product",
      label: "製品（Product）",
      description: "製品やサービスの特徴、価値提案について分析します。",
      placeholder: "例：\n・製品の特徴や機能\n・品質とブランド価値\n・製品ラインナップ\n・サービス内容"
    },
    {
      key: "price",
      label: "価格（Price）",
      description: "価格設定戦略と価格決定要因を分析します。",
      placeholder: "例：\n・価格帯と価格戦略\n・コスト構造\n・支払条件\n・割引政策"
    },
    {
      key: "place",
      label: "流通（Place）",
      description: "販売チャネルと流通戦略について分析します。",
      placeholder: "例：\n・販売チャネル\n・物流システム\n・在庫管理\n・販売地域"
    },
    {
      key: "promotion",
      label: "プロモーション（Promotion）",
      description: "販売促進と広告戦略について分析します。",
      placeholder: "例：\n・広告手法\n・販売促進策\n・PR活動\n・ブランディング"
    }
  ],
  "PEST": [
    {
      key: "political",
      label: "政治的要因（Political）",
      description: "政治や法規制の影響について分析します。",
      placeholder: "例：\n・関連法規制\n・政策動向\n・規制緩和/強化\n・政治的リスク"
    },
    {
      key: "economic",
      label: "経済的要因（Economic）",
      description: "経済環境と市場動向について分析します。",
      placeholder: "例：\n・景気動向\n・為替変動\n・金利動向\n・所得水準"
    },
    {
      key: "social",
      label: "社会的要因（Social）",
      description: "社会動向と人口統計について分析します。",
      placeholder: "例：\n・人口動態\n・ライフスタイル\n・価値観の変化\n・社会課題"
    },
    {
      key: "technological",
      label: "技術的要因（Technological）",
      description: "技術革新と影響について分析します。",
      placeholder: "例：\n・技術トレンド\n・研究開発動向\n・特許状況\n・新技術の影響"
    }
  ]
} as const;

interface AnalysisFormProps {
  type: AnalysisType;
  onComplete?: (analysis: any) => void;
}

interface GenerationStep {
  id: string;
  title: string;
  description: string;
  status: "waiting" | "processing" | "completed" | "error";
  error?: string;
}

export default function AnalysisForm({ type, onComplete }: AnalysisFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const createAnalysis = useCreateAnalysis();
  const { toast } = useToast();

  const steps = analysisSteps[type];
  const currentField = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // 生成ステップの状態管理
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    {
      id: "data_collection",
      title: "データ収集",
      description: "分析に必要な情報を収集しています",
      status: "waiting",
    },
    {
      id: "initial_analysis",
      title: "初期分析",
      description: "基本的な分析を実行しています",
      status: "waiting",
    },
    {
      id: "deep_analysis",
      title: "詳細分析",
      description: "深い洞察を導き出しています",
      status: "waiting",
    },
    {
      id: "final_recommendations",
      title: "最終提案",
      description: "具体的な提案を生成しています",
      status: "waiting",
    }
  ]);

  // ステップのステータスを更新する関数
  const updateStepStatus = (stepId: string, status: GenerationStep["status"], error?: string) => {
    setGenerationSteps(prev =>
      prev.map(step =>
        step.id === stepId
          ? { ...step, status, error }
          : step
      )
    );
  };

  const handleNext = () => {
    if (!formData[currentField.key]?.trim()) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "分析内容を入力してください。",
      });
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLastStep) {
      handleNext();
      return;
    }

    // 必須入力チェック
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "分析のタイトルを入力してください。",
      });
      return;
    }

    if (Object.keys(formData).length < steps.length) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "すべての分析項目を入力してください。",
      });
      return;
    }

    setIsProcessing(true);
    setShowPDF(false);
    setAnalysisResult(null);

    try {
      // データ収集ステップ開始
      updateStepStatus("data_collection", "processing");
      const formDataToSend = new FormData();
      formDataToSend.append("analysis_type", type);
      formDataToSend.append("title", title);
      formDataToSend.append("content", JSON.stringify(formData));

      if (referenceUrl) {
        formDataToSend.append("reference_url", referenceUrl);
      }

      if (file) {
        formDataToSend.append("attachment", file);
      }

      updateStepStatus("data_collection", "completed");
      updateStepStatus("initial_analysis", "processing");

      const analysis = await createAnalysis.mutateAsync(formDataToSend);

      if (analysis.content) {
        // 分析の各段階の状態を更新
        updateStepStatus("initial_analysis", "completed");
        updateStepStatus("deep_analysis", "completed");
        updateStepStatus("final_recommendations", "completed");

        setAnalysisResult(analysis);

        toast({
          title: "分析完了",
          description: "分析が正常に完了しました。",
        });

        if (onComplete) {
          onComplete(analysis);
        }
      }
    } catch (error: any) {
      // エラーが発生した場合、現在のステップをエラー状態に
      const currentStep = generationSteps.find(step => step.status === "processing");
      if (currentStep) {
        updateStepStatus(currentStep.id, "error", error.message);
      }

      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "分析中にエラーが発生しました。",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 分析結果をマークダウン形式に変換
  const getMarkdownContent = () => {
    if (!analysisResult?.content) return "";

    let markdown = "";
    const content = analysisResult.content;

    // 初期分析
    if (content.initial_analysis) {
      markdown += "## 初期分析\n\n";
      if (content.initial_analysis.key_points) {
        markdown += "### 主要ポイント\n";
        content.initial_analysis.key_points.forEach((point: string) => {
          markdown += `- ${point}\n`;
        });
        markdown += "\n";
      }
      if (content.initial_analysis.opportunities) {
        markdown += "### 機会\n";
        content.initial_analysis.opportunities.forEach((opp: string) => {
          markdown += `- ${opp}\n`;
        });
        markdown += "\n";
      }
      if (content.initial_analysis.challenges) {
        markdown += "### 課題\n";
        content.initial_analysis.challenges.forEach((challenge: string) => {
          markdown += `- ${challenge}\n`;
        });
        markdown += "\n";
      }
    }

    // 詳細分析
    if (content.deep_analysis) {
      markdown += "## 詳細分析\n\n";
      if (content.deep_analysis.company_insights) {
        markdown += "### 企業への示唆\n";
        content.deep_analysis.company_insights.forEach((insight: string) => {
          markdown += `- ${insight}\n`;
        });
        markdown += "\n";
      }
      if (content.deep_analysis.market_insights) {
        markdown += "### 市場への示唆\n";
        content.deep_analysis.market_insights.forEach((insight: string) => {
          markdown += `- ${insight}\n`;
        });
        markdown += "\n";
      }
      if (content.deep_analysis.competitive_insights) {
        markdown += "### 競争環境への示唆\n";
        content.deep_analysis.competitive_insights.forEach((insight: string) => {
          markdown += `- ${insight}\n`;
        });
        markdown += "\n";
      }
    }

    // 最終提案
    if (content.final_recommendations) {
      markdown += "## 最終提案\n\n";
      if (content.final_recommendations.strategic_moves) {
        markdown += "### 戦略的アクション\n";
        content.final_recommendations.strategic_moves.forEach((move: string) => {
          markdown += `- ${move}\n`;
        });
        markdown += "\n";
      }
      if (content.final_recommendations.action_items) {
        markdown += "### 具体的なアクション\n";
        content.final_recommendations.action_items.forEach((item: string) => {
          markdown += `- ${item}\n`;
        });
        markdown += "\n";
      }
      if (content.final_recommendations.risk_factors) {
        markdown += "### リスク要因\n";
        content.final_recommendations.risk_factors.forEach((risk: string) => {
          markdown += `- ${risk}\n`;
        });
      }
    }

    return markdown;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{type}分析（ステップ {currentStep + 1}/{steps.length}）</span>
          <div className="text-sm font-normal text-muted-foreground">
            {currentField.label}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル入力（最初のステップのみ） */}
          {currentStep === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">
                  分析タイトル
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：新製品の市場分析"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_url" className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  参考URL（任意）
                </Label>
                <Input
                  id="reference_url"
                  type="url"
                  placeholder="https://..."
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment" className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  添付資料（任意）
                </Label>
                <Input
                  id="attachment"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
              </div>
            </>
          )}

          {/* 分析内容入力 */}
          <div className="space-y-2">
            <Label htmlFor={currentField.key}>{currentField.description}</Label>
            <Textarea
              id={currentField.key}
              value={formData[currentField.key] || ""}
              onChange={(e) =>
                setFormData({ ...formData, [currentField.key]: e.target.value })
              }
              placeholder={currentField.placeholder}
              required
              className="min-h-[200px]"
            />
          </div>

          {/* 分析中の表示 */}
          {isProcessing && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
                <p className="text-lg font-medium text-primary">分析を実行中...</p>
                <p className="text-sm text-muted-foreground">しばらくお待ちください</p>
              </div>

              {/* 生成ステップの表示 */}
              <div className="space-y-4">
                {generationSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border ${
                      step.status === "processing"
                        ? "bg-muted animate-pulse"
                        : step.status === "completed"
                        ? "bg-green-50 dark:bg-green-950"
                        : step.status === "error"
                        ? "bg-red-50 dark:bg-red-950"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6">
                        {step.status === "processing" ? (
                          <Loader2 className="w-full h-full animate-spin text-primary" />
                        ) : step.status === "completed" ? (
                          <div className="w-full h-full rounded-full bg-green-500 text-white flex items-center justify-center">
                            ✓
                          </div>
                        ) : step.status === "error" ? (
                          <div className="w-full h-full rounded-full bg-red-500 text-white flex items-center justify-center">
                            ✕
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {step.status === "error" ? step.error : step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 分析結果の表示 */}
          {analysisResult && !isProcessing && (
            <>
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>分析結果</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert">
                  <Typewriter
                    content={getMarkdownContent()}
                    speed={30}
                    onComplete={() => setShowPDF(true)}
                  />
                </CardContent>
              </Card>

              {/* PDFプレビュー - タイプライター表示完了後に表示 */}
              {showPDF && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>PDFプレビュー</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnalysisPDFViewer analysis={analysisResult} />
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* ナビゲーションボタン */}
          <div className="flex justify-between gap-4">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                前のステップ
              </Button>
            )}
            <Button
              type={isLastStep ? "submit" : "button"}
              onClick={isLastStep ? undefined : handleNext}
              className={currentStep === 0 ? "w-full" : "ml-auto"}
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLastStep ? "分析を開始" : (
                <>
                  次のステップ
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}