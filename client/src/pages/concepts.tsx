import { useConcepts, useDeleteConcept } from "@/hooks/use-concept";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Loader2, PlusCircle, Trash2, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
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
import ConceptGenerator from "@/components/concept-generator";
import { useToast } from "@/hooks/use-toast";

export default function Concepts() {
  const { data: concepts, isLoading } = useConcepts();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const deleteConcept = useDeleteConcept();

  const handleDelete = async (id: string) => {
    try {
      await deleteConcept.mutateAsync(id);
      toast({
        title: "削除完了",
        description: "コンセプトを削除しました",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "削除中にエラーが発生しました",
      });
    }
  };

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
            <h1 className="text-4xl font-bold">商品コンセプト一覧</h1>
            <p className="text-muted-foreground">
              分析結果から生成された商品コンセプトの管理
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
        <div className="flex-1">
          <h1 className="text-4xl font-bold">商品コンセプト一覧</h1>
          <p className="text-muted-foreground">
            分析結果から生成された商品コンセプトの管理
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              新規コンセプト生成
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concepts?.map((concept) => (
          <Card
            key={concept.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader className="relative">
              <div className="absolute top-4 right-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>コンセプトの削除</AlertDialogTitle>
                      <AlertDialogDescription>
                        このコンセプトを削除してもよろしいですか？この操作は取り消せません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(concept.id)}
                        className="bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                      >
                        {deleteConcept.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        削除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <CardTitle className="pr-12">{concept.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {concept.created_at && format(new Date(concept.created_at), "PPP")}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">提供価値：</span>
                  {concept.value_proposition}
                </p>
                <p className="text-sm">
                  <span className="font-medium">対象顧客：</span>
                  {concept.target_customer}
                </p>
                <p className="text-sm">
                  <span className="font-medium">競合優位性：</span>
                  {concept.advantage}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}