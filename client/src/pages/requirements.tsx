import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ChevronRight, ArrowLeft } from "lucide-react";

interface Requirement {
  id: string;
  title: string;
  overview: string;
  created_at: string;
}

export default function Requirements() {
  const [, navigate] = useLocation();
  const { data: requirements, isLoading } = useQuery<Requirement[]>({
    queryKey: ["/api/requirements"],
  });

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
            <h1 className="text-4xl font-bold">要件書一覧</h1>
            <p className="text-muted-foreground">
              生成された要件書の一覧を表示します
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>要件書一覧</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[60%]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
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
          <h1 className="text-4xl font-bold">要件書一覧</h1>
          <p className="text-muted-foreground">
            生成された要件書の一覧を表示します
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>要件書一覧</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {requirements?.map((requirement) => (
            <div
              key={requirement.id}
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">{requirement.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {requirement.overview}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    作成日: {new Date(requirement.created_at).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/requirements/${requirement.id}`)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}