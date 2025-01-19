import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  title: string;
  url?: string;
  summary: string;
  citations?: string[];
}

export default function DeepSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch("/api/deep-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          searchType,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setResults(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "検索エラー",
        description: error.message,
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">深層検索</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>検索条件</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="query">検索キーワード</Label>
                <Input
                  id="query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="キーワードを入力（例：AI トレンド、データサイエンス 就職）"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">検索範囲</Label>
                <Select
                  value={searchType}
                  onValueChange={setSearchType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="検索範囲を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="news">ニュース</SelectItem>
                    <SelectItem value="academic">学術論文</SelectItem>
                    <SelectItem value="blog">ブログ・技術記事</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={isSearching}
                className="w-full"
              >
                {isSearching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                深層検索を実行
              </Button>
            </form>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">検索結果</h2>
            {results.map((result, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {result.url ? (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-2"
                      >
                        {result.title}
                        <LinkIcon className="h-4 w-4" />
                      </a>
                    ) : (
                      result.title
                    )}
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {result.summary}
                  </p>
                  {result.citations && result.citations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">参考文献：</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {result.citations.map((citation, idx) => (
                          <li key={idx}>
                            <a
                              href={citation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {citation}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}