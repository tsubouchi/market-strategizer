import { useAnalyses } from "@/hooks/use-analysis";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: analyses, isLoading } = useAnalyses();
  const [_, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Analyses</h1>
        <Button onClick={() => navigate("/analysis/new")}>
          New Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyses?.map((analysis) => (
          <Card
            key={analysis.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/analysis/${analysis.id}`)}
          >
            <CardHeader>
              <CardTitle>{analysis.analysis_type} Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(new Date(analysis.created_at), "PPP")}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {JSON.stringify(analysis.content)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}