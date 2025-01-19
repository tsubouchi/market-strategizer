import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Plus,
  RefreshCcw,
  Bell,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface Competitor {
  id: string;
  company_name: string;
  website_url: string;
  monitoring_keywords: string[];
  last_updated: string;
}

interface CompetitorUpdate {
  id: string;
  update_type: string;
  content: {
    summary: string;
    sources: string[];
    categories: {
      products: string;
      press: string;
      tech: string;
      market: string;
      sustainability: string;
    };
  };
  source_url: string;
  importance_score: "low" | "medium" | "high";
  is_notified: boolean;
  created_at: string;
}

export default function CompetitorMonitoring() {
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 競合他社一覧の取得
  const { data: competitors, isLoading } = useQuery<Competitor[]>({
    queryKey: ["/api/competitors"],
  });

  // 競合他社の追加
  const addCompetitorMutation = useMutation({
    mutationFn: async (data: {
      company_name: string;
      website_url: string;
      monitoring_keywords: string[];
    }) => {
      const response = await fetch("/api/competitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competitors"] });
      setIsAddingCompetitor(false);
      toast({
        title: "競合他社を追加しました",
        description: "モニタリングを開始します",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message,
      });
    },
  });

  // 更新機能
  const refreshCompetitorMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/competitors/${id}/refresh`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competitors"] });
      toast({
        title: "情報を更新しました",
        description: "最新の情報が反映されました",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "更新に失敗しました",
        description: error.message,
      });
    },
  });

  const handleAddCompetitor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const company_name = formData.get("company_name") as string;
    const website_url = formData.get("website_url") as string;
    const keywords = formData.get("keywords") as string;

    if (!company_name || !website_url || !keywords) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "すべての項目を入力してください",
      });
      return;
    }

    addCompetitorMutation.mutate({
      company_name,
      website_url,
      monitoring_keywords: keywords.split(",").map((k) => k.trim()),
    });
  };

  // 重要度に応じたバッジの表示
  const ImportanceBadge = ({ score }: { score: CompetitorUpdate["importance_score"] }) => {
    switch (score) {
      case "high":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            重要
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="gap-1">
            <Activity className="h-3 w-3" />
            中程度
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            軽微
          </Badge>
        );
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">競合他社モニタリング</h1>
          <p className="text-muted-foreground">
            競合他社の動向をリアルタイムで監視します
          </p>
        </div>
        <Dialog open={isAddingCompetitor} onOpenChange={setIsAddingCompetitor}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              競合他社を追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>競合他社の追加</DialogTitle>
              <DialogDescription>
                モニタリングしたい競合他社の情報を入力してください
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCompetitor}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">会社名</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    placeholder="例：株式会社Example"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_url">Webサイト</Label>
                  <Input
                    id="website_url"
                    name="website_url"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">
                    モニタリングキーワード（カンマ区切り）
                  </Label>
                  <Input
                    id="keywords"
                    name="keywords"
                    placeholder="製品名, サービス名, 技術キーワード"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={addCompetitorMutation.isPending}
                >
                  {addCompetitorMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  追加
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {competitors?.map((competitor) => (
          <Card key={competitor.id} className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{competitor.company_name}</CardTitle>
                  <CardDescription>
                    <a
                      href={competitor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {competitor.website_url}
                    </a>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshCompetitorMutation.mutate(competitor.id)}
                    disabled={refreshCompetitorMutation.isPending}
                  >
                    {refreshCompetitorMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-4 w-4 mr-2" />
                    )}
                    更新
                  </Button>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`notifications-${competitor.id}`}
                      defaultChecked={true}
                    />
                    <Label htmlFor={`notifications-${competitor.id}`}>通知</Label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    モニタリングキーワード
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {competitor.monitoring_keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">最新の更新</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>種類</TableHead>
                        <TableHead className="w-[40%]">内容</TableHead>
                        <TableHead>重要度</TableHead>
                        <TableHead>日時</TableHead>
                        <TableHead>ソース</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* デモデータ */}
                      <TableRow>
                        <TableCell>ニュース</TableCell>
                        <TableCell>
                          新製品「AI戦略アシスタント」の発表。競合他社分析機能を強化し、
                          リアルタイムモニタリング機能を追加。
                        </TableCell>
                        <TableCell>
                          <ImportanceBadge score="high" />
                        </TableCell>
                        <TableCell>{new Date().toLocaleDateString("ja-JP")}</TableCell>
                        <TableCell>
                          <a
                            href="https://bonginkan.ai/news/1234"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            詳細を見る
                          </a>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>技術動向</TableCell>
                        <TableCell>
                          大規模言語モデルを活用した新しい分析エンジンの開発を発表
                        </TableCell>
                        <TableCell>
                          <ImportanceBadge score="medium" />
                        </TableCell>
                        <TableCell>{new Date().toLocaleDateString("ja-JP")}</TableCell>
                        <TableCell>
                          <a
                            href="https://bonginkan.ai/tech/5678"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            詳細を見る
                          </a>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              最終更新: {new Date(competitor.last_updated).toLocaleString("ja-JP")}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}