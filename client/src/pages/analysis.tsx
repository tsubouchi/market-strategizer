import { useParams, useLocation } from "wouter";
import { useAnalysis } from "@/hooks/use-analysis";
import AnalysisForm from "@/components/analysis-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Link as LinkIcon, Paperclip } from "lucide-react";

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { data: analysis, isLoading } = useAnalysis(id || "");

  if (id === "new") {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <AnalysisForm
            type="3C"
            onComplete={() => navigate("/dashboard")}
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
    return <div>Analysis not found</div>;
  }

  const content = analysis.content as Record<string, string>;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          ← Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{analysis.analysis_type} Analysis</CardTitle>
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
                    Reference URL
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
                    View Attachment
                  </a>
                </div>
              )}

              {Object.entries(content).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <h3 className="font-medium capitalize">{key}</h3>
                  <p className="text-muted-foreground">{value}</p>
                </div>
              ))}

              {analysis.ai_feedback && (
                <div className="mt-8">
                  <h3 className="font-medium mb-2">AI Feedback</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap">
                      {analysis.ai_feedback}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}