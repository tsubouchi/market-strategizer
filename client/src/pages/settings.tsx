import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, EyeOff, Eye, Check } from "lucide-react";

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const apiKey = "sk-************************************"; // 実際のAPIキーは環境変数から取得

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "コピー完了",
        description: "APIキーをクリップボードにコピーしました。",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "APIキーのコピーに失敗しました。",
      });
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">設定</h1>
        <p className="text-muted-foreground">
          アプリケーションの設定を管理します
        </p>
      </div>

      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>APIモデル設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>使用モデル</Label>
              <Input
                value="gpt-4"
                readOnly
                className="font-mono bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                現在の分析には最新のGPT-4モデルを使用しています
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>APIキー設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>OpenAI APIキー</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    readOnly
                    className="font-mono pr-24"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                このAPIキーは暗号化されて保存されています
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}