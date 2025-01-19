import { useState } from "react";
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
import { Loader2, Settings } from "lucide-react";

interface RequirementsForm {
  timeline?: string;
  budget_range?: string;
  team_size?: string;
  technical_constraints?: string[];
}

export default function ConceptGenerator() {
  const { data: analyses, isLoading } = useAnalyses();
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [requirementsForm, setRequirementsForm] = useState<RequirementsForm>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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
      toast({
        title: "コンセプト生成完了",
        description: "商品コンセプトが正常に生成されました。",
      });

      // 要件書の生成
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

      const requirements = await requirementsResponse.json();
      toast({
        title: "要件書生成完了",
        description: "要件書が正常に生成されました。",
      });

      // TODO: 要件書の表示画面に遷移
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

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