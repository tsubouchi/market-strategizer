import { useState } from "react";
import { useShareAnalysis } from "@/hooks/use-analysis";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Share2, Loader2 } from "lucide-react";

interface ShareAnalysisProps {
  analysisId: string;
}

export default function ShareAnalysis({ analysisId }: ShareAnalysisProps) {
  const [userId, setUserId] = useState("");
  const [canComment, setCanComment] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const shareAnalysis = useShareAnalysis();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim()) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "ユーザーIDを入力してください。",
      });
      return;
    }

    try {
      await shareAnalysis.mutateAsync({
        analysisId,
        userId: parseInt(userId),
        canComment,
      });

      setIsOpen(false);
      toast({
        title: "共有完了",
        description: "分析を共有しました。",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          共有
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>分析を共有</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user_id">共有するユーザーID</Label>
            <Input
              id="user_id"
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="ユーザーIDを入力..."
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="can_comment"
              checked={canComment}
              onCheckedChange={(checked) => setCanComment(checked as boolean)}
            />
            <Label htmlFor="can_comment">
              コメントを許可する
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={shareAnalysis.isPending}
          >
            {shareAnalysis.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            共有する
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
