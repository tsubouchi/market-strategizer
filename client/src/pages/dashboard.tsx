import { useAnalyses } from "@/hooks/use-analysis";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Loader2, PlusCircle, Lightbulb } from "lucide-react";
import ConceptGenerator from "@/components/concept-generator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
        <h1 className="text-4xl font-bold">分析一覧</h1>
        <div className="flex gap-4">
          <Button onClick={() => navigate("/analysis/new")}>
            <PlusCircle className="w-4 h-4 mr-2" />
            新規分析
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Lightbulb className="w-4 h-4 mr-2" />
                コンセプト生成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>商品コンセプト生成</DialogTitle>
              </DialogHeader>
              <ConceptGenerator />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyses?.map((analysis) => (
          <Card
            key={analysis.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/analysis/${analysis.id}`)}
          >
            <CardHeader>
              <CardTitle>{analysis.analysis_type}分析</CardTitle>
              <p className="text-sm text-muted-foreground">
                {analysis.created_at && format(new Date(analysis.created_at), "PPP")}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {Object.entries(analysis.content as Record<string, string>)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join("\n")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}