import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, RefreshCcw, Bell } from "lucide-react";

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
  content: any;
  source_url: string;
  importance_score: string;
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
          <Card key={competitor.id}>
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
                  <Button variant="outline" size="sm">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    更新
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    通知設定
                  </Button>
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
                        <TableHead>内容</TableHead>
                        <TableHead>重要度</TableHead>
                        <TableHead>日時</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* TODO: 更新情報の表示 */}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
