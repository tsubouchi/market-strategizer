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
  Edit2,
  ArrowLeft,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface Competitor {
  id: string;
  company_name: string;
  website_url: string;
  monitoring_keywords: string[];
  last_updated: string;
  updates?: CompetitorUpdate[];
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

const CategoryInfo = ({ category, content }: { category: string; content: string }) => {
  if (!content || content === "情報なし") return null;

  return (
    <div className="space-y-2">
      <h5 className="text-sm font-medium">{category}</h5>
      <p className="text-sm text-muted-foreground">{content}</p>
    </div>
  );
};

const LoadingCard = () => (
  <Card className="shadow-sm">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-24" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-48" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-16 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </CardContent>
    <CardFooter className="text-sm text-muted-foreground">
      <Skeleton className="h-4 w-48" />
    </CardFooter>
  </Card>
);

const KeywordEditDialog = ({
  competitor,
  isOpen,
  onOpenChange
}: {
  competitor: Competitor;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [keywords, setKeywords] = useState(competitor.monitoring_keywords.join(", "));

  const updateKeywordsMutation = useMutation({
    mutationFn: async (data: { id: string; keywords: string[] }) => {
      const response = await fetch(`/api/competitors/${data.id}/keywords`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monitoring_keywords: data.keywords,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competitors"] });
      onOpenChange(false);
      toast({
        title: "キーワードを更新しました",
        description: "モニタリングキーワードが更新されました",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keywordArray = keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keywordArray.length === 0) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "少なくとも1つのキーワードを入力してください",
      });
      return;
    }

    updateKeywordsMutation.mutate({
      id: competitor.id,
      keywords: keywordArray,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>モニタリングキーワードの編集</DialogTitle>
          <DialogDescription>
            {competitor.company_name}のモニタリングキーワードを編集します
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">
                モニタリングキーワード（カンマ区切り）
              </Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="製品名, サービス名, 技術キーワード"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={updateKeywordsMutation.isPending}
            >
              {updateKeywordsMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              更新
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


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

export default function CompetitorMonitoring() {
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: competitors, isLoading } = useQuery<Competitor[]>({
    queryKey: ["/api/competitors"],
  });

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
          <div className="flex-1">
            <h1 className="text-4xl font-bold">競合他社モニタリング</h1>
            <p className="text-muted-foreground">
              競合他社の動向をリアルタイムで監視します
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
          <h1 className="text-4xl font-bold">競合他社モニタリング</h1>
          <p className="text-muted-foreground">
            競合他社の動向をリアルタイムで監視します
          </p>
        </div>
        <div className="flex gap-4">
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
      </div>

      <div className="grid gap-8">
        <AnimatePresence>
          {competitors?.map((competitor) => (
            <motion.div
              key={competitor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-sm">
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
                        className="relative"
                      >
                        {refreshCompetitorMutation.isPending && (
                          <motion.div
                            className="absolute inset-0 bg-primary/10 rounded-md"
                            animate={{ opacity: [0.5, 0.2] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
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
                    <div className="flex justify-between items-start">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCompetitor(competitor)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
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
                          {competitor.updates?.map((update) => (
                            <TableRow key={update.id}>
                              <TableCell>{update.update_type === "deep_search" ? "AI分析" : update.update_type}</TableCell>
                              <TableCell>
                                <div className="space-y-4">
                                  <p className="font-medium">
                                    {update.content?.summary || "No summary available"}
                                  </p>
                                  <div className="space-y-2">
                                    <CategoryInfo category="製品・サービス" content={update.content?.categories?.products} />
                                    <CategoryInfo category="プレス情報" content={update.content?.categories?.press} />
                                    <CategoryInfo category="技術革新" content={update.content?.categories?.tech} />
                                    <CategoryInfo category="市場動向" content={update.content?.categories?.market} />
                                    <CategoryInfo category="サステナビリティ" content={update.content?.categories?.sustainability} />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <ImportanceBadge score={update.importance_score} />
                              </TableCell>
                              <TableCell>{new Date(update.created_at).toLocaleDateString("ja-JP")}</TableCell>
                              <TableCell>
                                {update.content.sources && update.content.sources.length > 0 && (
                                  <div className="space-y-1">
                                    {update.content.sources.map((source, index) => (
                                      <a
                                        key={index}
                                        href={source}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline block"
                                      >
                                        ソース {index + 1}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  最終更新: {new Date(competitor.last_updated).toLocaleString("ja-JP")}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {editingCompetitor && (
        <KeywordEditDialog
          competitor={editingCompetitor}
          isOpen={!!editingCompetitor}
          onOpenChange={(open) => !open && setEditingCompetitor(null)}
        />
      )}
    </div>
  );
}