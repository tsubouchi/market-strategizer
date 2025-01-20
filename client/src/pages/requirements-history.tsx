import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface Requirement {
  id: string;
  title: string;
  overview: string;
  target_users: string;
  features: string | string[];
  tech_stack: string | Record<string, any>;
  ui_ux_requirements: string | Record<string, any>;
  schedule: string | Record<string, any>;
  created_at: string;
  concept_id: string;
}

export default function RequirementsHistory() {
  const [, navigate] = useLocation();
  const { data: requirements, isLoading } = useQuery<Requirement[]>({
    queryKey: ["/api/product_requirements"],
  });

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">要件書履歴</h1>
            <p className="text-muted-foreground">
              生成された要件書の履歴一覧
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner size="lg" className="text-primary" />
        </div>
      </div>
    );
  }

  if (!requirements?.length) {
    return (
      <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">要件書履歴</h1>
            <p className="text-muted-foreground">
              生成された要件書の履歴一覧
            </p>
          </div>
        </div>
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2">履歴がありません</h2>
            <p className="text-sm text-muted-foreground">
              まだ要件書が生成されていません
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
          <h1 className="text-4xl font-bold">要件書履歴</h1>
          <p className="text-muted-foreground">
            生成された要件書の履歴一覧
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requirements.map((requirement) => (
          <Card
            key={requirement.id}
            className="hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm cursor-pointer"
            onClick={() => navigate(`/requirements/${requirement.id}`)}
          >
            <CardHeader>
              <CardTitle className="line-clamp-2">{requirement.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {requirement.created_at && format(new Date(requirement.created_at), "PPP")}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">概要：</span>
                  <span className="line-clamp-3">{requirement.overview}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">対象ユーザー：</span>
                  <span className="line-clamp-2">{requirement.target_users}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">主要機能：</span>
                  <span className="line-clamp-2">
                    {(() => {
                      try {
                        const features = typeof requirement.features === 'string' 
                          ? JSON.parse(requirement.features)
                          : requirement.features;
                        return Array.isArray(features) 
                          ? features.slice(0, 3).join(', ')
                          : '機能情報なし';
                      } catch (e) {
                        return '機能情報なし';
                      }
                    })()}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}