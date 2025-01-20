import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, FileText } from "lucide-react";

interface HistoryItem {
  id: string;
  title: string;
  type: string;
  created_at: string;
}

export default function History() {
  const [, navigate] = useLocation();
  const { data: history, isLoading } = useQuery<HistoryItem[]>({
    queryKey: ["/api/history"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>作成履歴</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>作成履歴</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {history?.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  <Clock className="inline-block h-4 w-4 mr-1" />
                  {new Date(item.created_at).toLocaleString("ja-JP")}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/${item.type}/${item.id}`)}
              >
                詳細を見る
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}