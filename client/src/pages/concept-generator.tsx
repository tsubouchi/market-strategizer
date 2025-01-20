import { useState, useEffect } from "react";
import { useAnalyses } from "@/hooks/use-analysis";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RequirementsForm {
  timeline?: string;
  budget_range?: string;
  team_size?: string;
  technical_constraints?: string[];
}

interface GenerationStep {
  id: string;
  title: string;
  description: string;
  status: "waiting" | "processing" | "completed" | "error";
  error?: string;
}

interface Requirements {
  id: string;
  title: string; // Added title property
  // その他の必要なプロパティ
}

export default function ConceptGenerator() {
  const { data: analyses, isLoading } = useAnalyses();
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [requirementsForm, setRequirementsForm] = useState<RequirementsForm>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/requirements/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concepts"] });
      toast({
        title: "削除完了",
        description: "要件書を削除しました",
      });
      setRequirements(null); //added to clear requirement after delete
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message,
      });
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const [steps, setSteps] = useState<GenerationStep[]>([
    {
      id: "analyze",
      title: "分析データの統合",
      description: "選択された分析を統合し、要点を抽出します",
      status: "waiting",
    },
    {
      id: "concept",
      title: "コンセプト生成",
      description: "商品コンセプトの候補を生成します",
      status: "waiting",
    },
    {
      id: "requirements",
      title: "要件書生成",
      description: "詳細な要件定義を行います",
      status: "waiting",
    },
  ]);
  const [requirements, setRequirements] = useState<Requirements | null>(null); // Added state for requirements
  

  const handleAnalysisSelect = (analysisId: string) => {
    setSelectedAnalyses((current) =>
      current.includes(analysisId)
        ? current.filter((id) => id !== analysisId)
        : [...current, analysisId]
    );
  };

  const handleRequirementsChange = (field: keyof RequirementsForm, value: string) => {
    setRequirementsForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateStepStatus = (stepId: string, status: GenerationStep["status"], error?: string) => {
    setSteps((current) =>
      current.map((step) =>
        step.id === stepId
          ? { ...step, status, ...(error ? { error } : {}) }
          : step
      )
    );
  };

  const handleGenerate = async () => {
    if (selectedAnalyses.length === 0) {
      toast({
        variant: "destructive",
        title: "分析を選択してください",
        description: "コンセプトを生成するには、少なくとも1つの分析を選択する必要があります。",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Step 1: コンセプト生成
      updateStepStatus("analyze", "processing");
      const response = await fetch("/api/concepts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysis_ids: selectedAnalyses,
          requirements: requirementsForm,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      updateStepStatus("analyze", "completed");
      updateStepStatus("concept", "processing");
      toast({
        title: "コンセプト生成完了",
        description: "商品コンセプトが正常に生成されました。",
      });

      // Step 2: 要件書の生成
      updateStepStatus("concept", "completed");
      updateStepStatus("requirements", "processing");
      const requirementsResponse = await fetch(`/api/concepts/${result.id}/requirements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conditions: requirementsForm,
        }),
      });

      if (!requirementsResponse.ok) {
        throw new Error(await requirementsResponse.text());
      }

      const requirementsData = await requirementsResponse.json();
      setRequirements(requirementsData); // Update requirements state
      updateStepStatus("requirements", "completed");
      toast({
        title: "要件書生成完了",
        description: "要件書が正常に生成されました。",
      });


    } catch (error: any) {
      const currentStep = steps.find((step) => step.status === "processing");
      if (currentStep) {
        updateStepStatus(currentStep.id, "error", error.message);
      }
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (requirementId: string) => {
    try {
      const response = await fetch(`/api/requirements/${requirementId}/download`);
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers.get("content-disposition")?.split("filename=")[1].replace(/"/g, "") || "requirements.md";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "ダウンロード完了",
        description: "要件書のダウンロードが完了しました。",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    if (requirements) {
      handleDownload(requirements.id);
    }
  }, [requirements]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>分析の選択</CardTitle>
            <CardDescription>
              コンセプトの生成に使用する分析を選択してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyses?.map((analysis) => (
              <div key={analysis.id} className="flex items-center space-x-2">
                <Checkbox
                  id={analysis.id}
                  checked={selectedAnalyses.includes(analysis.id)}
                  onCheckedChange={() => handleAnalysisSelect(analysis.id)}
                />
                <Label htmlFor={analysis.id} className="flex-1">
                  <span className="font-medium">{analysis.analysis_type}分析</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </span>
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>要件設定</CardTitle>
            <CardDescription>
              プロジェクトの制約条件を設定してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timeline">開発期間</Label>
              <Select
                value={requirementsForm.timeline}
                onValueChange={(value) => handleRequirementsChange("timeline", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="開発期間を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3months">1-3ヶ月</SelectItem>
                  <SelectItem value="3-6months">3-6ヶ月</SelectItem>
                  <SelectItem value="6-12months">6-12ヶ月</SelectItem>
                  <SelectItem value="12+months">12ヶ月以上</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">予算規模</Label>
              <Select
                value={requirementsForm.budget_range}
                onValueChange={(value) => handleRequirementsChange("budget_range", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="予算規模を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">〜500万円</SelectItem>
                  <SelectItem value="medium">500万円〜2000万円</SelectItem>
                  <SelectItem value="large">2000万円〜5000万円</SelectItem>
                  <SelectItem value="enterprise">5000万円以上</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_size">チーム規模</Label>
              <Select
                value={requirementsForm.team_size}
                onValueChange={(value) => handleRequirementsChange("team_size", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="チーム規模を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">1-3人</SelectItem>
                  <SelectItem value="medium">4-8人</SelectItem>
                  <SelectItem value="large">9-15人</SelectItem>
                  <SelectItem value="enterprise">16人以上</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 要件書一覧セクションを追加 */}
        {requirements && (
          <Card>
            <CardHeader>
              <CardTitle>生成された要件書</CardTitle>
              <CardDescription>
                最新の要件書の内容を確認できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{requirements.title}</h3>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>要件書の削除</AlertDialogTitle>
                        <AlertDialogDescription>
                          この要件書を削除してもよろしいですか？この操作は取り消せません。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(requirements.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          削除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 生成ステップの表示 */}
        {isGenerating && (
          <Card>
            <CardHeader>
              <CardTitle>生成状況</CardTitle>
              <CardDescription>
                各ステップの処理状況を確認できます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg transition-colors",
                    step.status === "processing" && "bg-muted animate-pulse",
                    step.status === "completed" && "bg-green-50",
                    step.status === "error" && "bg-red-50"
                  )}
                >
                  {step.status === "processing" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary mt-0.5" />
                  ) : step.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : step.status === "error" ? (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.error && (
                      <p className="text-sm text-red-500 mt-1">{step.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || selectedAnalyses.length === 0}
          className="w-full"
        >
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isGenerating ? "生成中..." : "コンセプトと要件書を生成"}
        </Button>
      </div>
    </div>
  );
}