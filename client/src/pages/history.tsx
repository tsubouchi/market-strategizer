import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Loader2, FileText } from "lucide-react";

interface HistoryItem {
  id: string;
  title: string;
  type: string;
  content: Record<string, string>;
  created_at: string;
}

export default function History() {
  const [_, navigate] = useLocation();

  const { data: history, isLoading } = useQuery<HistoryItem[]>({
    queryKey: ["/api/history"],
  });

  const handleNavigate = (item: HistoryItem) => {
    switch (item.type.toLowerCase()) {
      case 'analysis':
        navigate(`/analysis/${item.id}`);
        break;
      case 'requirement':
        navigate(`/requirements/${item.id}`);
        break;
      default:
        navigate(`/${item.type.toLowerCase()}/${item.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">作成履歴</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history?.map((item) => (
          <Card
            key={item.id}
            className="hover:shadow-lg transition-shadow relative group cursor-pointer"
            onClick={() => handleNavigate(item)}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div>
                  <div className="text-xl">{item.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {item.type}
                  </div>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {item.created_at && format(new Date(item.created_at), "PPP")}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {Object.entries(item.content)
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