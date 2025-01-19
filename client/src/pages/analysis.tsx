import { useLocation, useParams } from "wouter";
import { useAnalysis, useUpdateAnalysisVisibility } from "@/hooks/use-analysis";
import AnalysisForm, { AnalysisType } from "@/components/analysis-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Link as LinkIcon,
  Paperclip,
  FileDown,
  Globe,
  Lock,
} from "lucide-react";
import { AnalysisPDFViewer } from "@/components/analysis-pdf";
import Comments from "@/components/comments";
import { useToast } from "@/hooks/use-toast";
import ShareAnalysis from "@/components/share-analysis";

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [location, navigate] = useLocation();
  const { data: analysis, isLoading } = useAnalysis(id || "");
  const updateVisibility = useUpdateAnalysisVisibility();
  const { toast } = useToast();

  // 新規分析の場合
  if (id === "new") {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as AnalysisType;

    if (!type || !["3C", "4P", "PEST"].includes(type)) {
      navigate("/");
      return null;
    }

    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              ← トップに戻る
            </Button>
          </div>
          <AnalysisForm
            type={type}
            onComplete={(analysis) => navigate(`/analysis/${analysis.id}`)}
          />
        </div>
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
    return <div>分析が見つかりません</div>;
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
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          ← ダッシュボードに戻る
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Analysis Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{analysis.analysis_type}分析の結果</span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.print()}
                  >
                    <FileDown className="w-4 h-4" />
                    PDF
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

          {/* Right Column: PDF Preview and Comments */}
          <div className="space-y-8">
            {/* PDF Preview */}
            <Card>
              <CardHeader>
                <CardTitle>PDFプレビュー</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <AnalysisPDFViewer analysis={analysis} />
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Comments analysisId={analysis.id} />
          </div>
        </div>
      </div>
    </div>
  );
}