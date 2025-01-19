import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";

export default function DeepSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // TODO: 深層検索APIの実装
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResults([
        { title: "テスト結果1", url: "https://example.com", summary: "サマリー1" },
        { title: "テスト結果2", url: "https://example.com", summary: "サマリー2" },
      ]);
    } catch (error) {
      console.error("Search error:", error);
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
              <Card key={index}>
                <CardContent className="py-4">
                  <h3 className="font-semibold mb-2">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {result.title}
                    </a>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {result.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
