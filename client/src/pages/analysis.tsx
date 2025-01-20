import { useLocation, useParams } from "wouter";
import { useAnalysis, useUpdateAnalysisVisibility } from "@/hooks/use-analysis";
import AnalysisForm, { AnalysisType } from "@/components/analysis-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Link as LinkIcon,
  Paperclip,
  Globe,
  Lock,
} from "lucide-react";
import Comments from "@/components/comments";
import { useToast } from "@/hooks/use-toast";
import ShareAnalysis from "@/components/share-analysis";

interface AnalysisPageProps {
  type?: AnalysisType;
}

export default function AnalysisPage({ type }: AnalysisPageProps) {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { data: analysis, isLoading } = useAnalysis(id || "");
  const updateVisibility = useUpdateAnalysisVisibility();
  const { toast } = useToast();

  // 新規分析の場合
  if (id === "new" || type) {
    const analysisType = type || (new URLSearchParams(window.location.search).get("type") as AnalysisType);

    if (!analysisType || !["3C", "4P", "PEST"].includes(analysisType)) {
      navigate("/");
      return null;
    }

    return (
      <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            ← トップに戻る
          </Button>
          <h1 className="text-4xl font-bold mb-2">{analysisType}分析の作成</h1>
          <p className="text-muted-foreground">
            分析に必要な情報を入力してください
          </p>
        </div>
        <AnalysisForm
          type={analysisType}
          onComplete={(analysis) => navigate(`/analysis/${analysis.id}`)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="w-full">
        <Card>
          <CardContent className="flex items-center justify-center min-h-[200px]">
            <p className="text-muted-foreground">分析が見つかりません</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const content = analysis.content as Record<string, string>;

  const handleVisibilityToggle = async () => {
    try {
      await updateVisibility.mutateAsync({
        id: analysis.id,
        is_public: !analysis.is_public,
      });

      toast({
        title: "更新完了",
        description: analysis.is_public
          ? "分析を非公開に設定しました"
          : "分析を公開に設定しました",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message,
      });
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          ← ダッシュボードに戻る
        </Button>
        <h1 className="text-4xl font-bold mb-2">{analysis.analysis_type}分析の結果</h1>
        <p className="text-muted-foreground">
          分析結果の詳細を確認できます
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Analysis Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{analysis.title}</span>
              <div className="flex items-center gap-2">
                <ShareAnalysis analysisId={analysis.id} />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleVisibilityToggle}
                >
                  {analysis.is_public ? (
                    <>
                      <Globe className="w-4 h-4" />
                      公開中
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      非公開
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Reference URL */}
              {analysis.reference_url && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  <a
                    href={analysis.reference_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    参考URL
                  </a>
                </div>
              )}

              {/* Attachment */}
              {analysis.attachment_path && (
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  <a
                    href={`/api/uploads/${analysis.attachment_path.split("/").pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    添付資料を表示
                  </a>
                </div>
              )}

              {/* Analysis Content */}
              {Object.entries(content).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <h3 className="font-medium capitalize">{key}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{value}</p>
                </div>
              ))}

              {/* AI Feedback */}
              {analysis.ai_feedback && (
                <div className="mt-8">
                  <h3 className="font-medium mb-2">AI分析結果</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">
                      {analysis.ai_feedback}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Comments analysisId={analysis.id} />
      </div>
    </div>
  );
}