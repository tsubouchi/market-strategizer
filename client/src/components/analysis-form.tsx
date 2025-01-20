import { useState } from "react";
import { useCreateAnalysis } from "@/hooks/use-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link as LinkIcon, Paperclip, ArrowLeft, ArrowRight } from "lucide-react";
import { AnalysisPDFViewer } from "./analysis-pdf";

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

export default function AnalysisForm({ type, onComplete }: AnalysisFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<any | null>(null); // Changed to any to accommodate potential structure
  const createAnalysis = useCreateAnalysis();
  const { toast } = useToast();

  const steps = analysisSteps[type];
  const currentField = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (!title && currentStep === 0) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "分析のタイトルを入力してください。",
      });
      return;
    }

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

    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "分析のタイトルを入力してください。",
      });
      return;
    }

    setIsProcessing(true);
    setProcessStatus("分析を実行中...");
    setAnalysisResult(null);

    try {
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

      const analysis = await createAnalysis.mutateAsync(formDataToSend);

      // 分析が完了し、結果が有効な場合のみ表示
      if (analysis.content && !analysis.content.message?.includes("準備中")) {
        setAnalysisResult(analysis);
      }

      toast({
        title: "分析完了",
        description: "分析が正常に保存されました。",
      });

      if (onComplete) {
        onComplete(analysis);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "分析の保存中にエラーが発生しました。",
      });
    } finally {
      setIsProcessing(false);
      setProcessStatus("");
    }
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

          {/* 分析結果の表示 - 完了した結果のみ表示 */}
          {analysisResult && !isProcessing && (
            <>
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>分析結果</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert">
                  <ReactMarkdown>
                    {Object.entries(analysisResult.content)
                      .filter(([_, value]) => !value.message?.includes("準備中"))
                      .map(([key, value]) => `### ${key}\n${value}`)
                      .join('\n\n')}
                  </ReactMarkdown>
                </CardContent>
              </Card>

              {/* PDFプレビュー - 完了した分析結果のみ表示 */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>PDFプレビュー</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalysisPDFViewer analysis={analysisResult} />
                </CardContent>
              </Card>
            </>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 py-4 text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{processStatus}</span>
            </div>
          )}

          <div className="flex justify-between gap-4">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                前のステップ
              </Button>
            )}
            <Button
              type="submit"
              className={currentStep === 0 ? "w-full" : "ml-auto"}
              disabled={createAnalysis.isPending || isProcessing}
            >
              {(createAnalysis.isPending || isProcessing) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isLastStep ? "分析を完了" : (
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