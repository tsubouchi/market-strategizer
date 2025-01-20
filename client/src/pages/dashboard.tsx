import { useAnalyses, useDeleteAnalysis } from "@/hooks/use-analysis";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Loader2, PlusCircle, Lightbulb, Trash2, ArrowLeft } from "lucide-react";
import ConceptGenerator from "@/components/concept-generator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: analyses, isLoading } = useAnalyses();
  const deleteAnalysis = useDeleteAnalysis();
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">分析一覧</h1>
            <p className="text-muted-foreground">
              戦略分析の履歴と結果の管理
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold">分析一覧</h1>
          <p className="text-muted-foreground">
            戦略分析の履歴と結果の管理
          </p>
        </div>
        <div className="flex gap-4 ml-auto">
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
                <DialogDescription>
                  既存の分析結果を選択し、商品コンセプトを生成します。予算や開発期間などの条件を指定することで、より具体的なコンセプトを作成できます。
                </DialogDescription>
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
            className="hover:shadow-lg transition-shadow relative group"
          >
            <div 
              className="cursor-pointer"
              onClick={() => navigate(`/analysis/${analysis.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <div className="text-xl">{analysis.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {analysis.analysis_type}分析
                    </div>
                  </div>
                </CardTitle>
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
            </div>

            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>分析の削除</AlertDialogTitle>
                    <AlertDialogDescription>
                      この分析を削除してもよろしいですか？この操作は取り消せません。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(analysis.id)}
                      className="bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                    >
                      {deleteAnalysis.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      削除する
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}