import { useState } from "react";
import { useAnalyses } from "@/hooks/use-analysis";
import { useGenerateConcept, useRefineConcept } from "@/hooks/use-concept";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ConceptGeneratorProps {
  onComplete?: (concept: any) => void;
}

export default function ConceptGenerator({ onComplete }: ConceptGeneratorProps) {
  const { data: analyses } = useAnalyses();
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [conditions, setConditions] = useState({
    budget: "",
    timeline: "",
    resources: "",
    preferences: "",
  });
  const generateConcept = useGenerateConcept();
  const refineConcept = useRefineConcept();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAnalyses.length === 0) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "分析を選択してください。",
      });
      return;
    }

    try {
      // コンセプトの生成
      const concept = await generateConcept.mutateAsync({
        analysis_ids: selectedAnalyses,
      });

      // 条件に基づく調整
      if (Object.values(conditions).some(Boolean)) {
        const refinedConcept = await refineConcept.mutateAsync({
          id: concept.id,
          conditions,
        });
        onComplete?.(refinedConcept);
      } else {
        onComplete?.(concept);
      }

      toast({
        title: "コンセプト生成完了",
        description: "商品コンセプトが正常に生成されました。",
      });
    } catch (error: any) {
      console.error("Concept generation error:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "コンセプト生成中にエラーが発生しました。",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>商品コンセプト生成</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 分析選択 */}
          <div className="space-y-4">
            <Label>使用する分析の選択</Label>
            <div className="grid gap-2">
              {analyses?.map((analysis) => (
                <div key={analysis.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={analysis.id}
                    checked={selectedAnalyses.includes(analysis.id)}
                    onCheckedChange={(checked) => {
                      setSelectedAnalyses(
                        checked
                          ? [...selectedAnalyses, analysis.id]
                          : selectedAnalyses.filter((id) => id !== analysis.id)
                      );
                    }}
                  />
                  <Label htmlFor={analysis.id}>
                    {analysis.analysis_type}分析（
                    {new Date(analysis.created_at || "").toLocaleString()}）
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* 条件入力 */}
          <div className="space-y-4">
            <Label>コンセプト調整の条件（任意）</Label>
            <div className="space-y-2">
              <Input
                placeholder="予算の制約"
                value={conditions.budget}
                onChange={(e) =>
                  setConditions({ ...conditions, budget: e.target.value })
                }
              />
              <Input
                placeholder="開発期間"
                value={conditions.timeline}
                onChange={(e) =>
                  setConditions({ ...conditions, timeline: e.target.value })
                }
              />
              <Input
                placeholder="利用可能なリソース"
                value={conditions.resources}
                onChange={(e) =>
                  setConditions({ ...conditions, resources: e.target.value })
                }
              />
              <Textarea
                placeholder="その他の要望や制約"
                value={conditions.preferences}
                onChange={(e) =>
                  setConditions({ ...conditions, preferences: e.target.value })
                }
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={generateConcept.isPending || refineConcept.isPending}
          >
            {(generateConcept.isPending || refineConcept.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            コンセプトを生成
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}