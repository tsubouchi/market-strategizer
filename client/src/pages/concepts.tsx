import { useConcepts } from "@/hooks/use-concept";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Loader2, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import ConceptGenerator from "@/components/concept-generator";

export default function Concepts() {
  const { data: concepts, isLoading } = useConcepts();
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
        <h1 className="text-4xl font-bold">商品コンセプト一覧</h1>
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
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader>
              <CardTitle>{concept.title}</CardTitle>
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
