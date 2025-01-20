import { useConcepts } from "@/hooks/use-concept";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { History } from "lucide-react";

export default function ConceptHistory() {
  const { data: concepts, isLoading } = useConcepts();

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">コンセプト履歴</h1>
            <p className="text-muted-foreground">
              生成された商品コンセプトの履歴一覧
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner size="lg" className="text-primary" />
        </div>
      </div>
    );
  }

  if (!concepts?.length) {
    return (
      <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">コンセプト履歴</h1>
            <p className="text-muted-foreground">
              生成された商品コンセプトの履歴一覧
            </p>
          </div>
        </div>
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2">履歴がありません</h2>
            <p className="text-sm text-muted-foreground">
              まだコンセプトが生成されていません
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">コンセプト履歴</h1>
          <p className="text-muted-foreground">
            生成された商品コンセプトの履歴一覧
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concepts.map((concept) => (
          <Card
            key={concept.id}
            className="hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm"
          >
            <CardHeader>
              <CardTitle className="line-clamp-2">{concept.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {concept.created_at && format(new Date(concept.created_at), "PPP")}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">提供価値：</span>
                  <span className="line-clamp-2">{concept.value_proposition}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">対象顧客：</span>
                  <span className="line-clamp-2">{concept.target_customer}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">競合優位性：</span>
                  <span className="line-clamp-2">{concept.advantage}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
