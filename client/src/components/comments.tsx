import { useState } from "react";
import { useComments, useCreateComment } from "@/hooks/use-comments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useUser } from "@/hooks/use-user";

interface CommentsProps {
  analysisId: string;
}

export default function Comments({ analysisId }: CommentsProps) {
  const [newComment, setNewComment] = useState("");
  const { data: comments, isLoading } = useComments(analysisId);
  const createComment = useCreateComment();
  const { toast } = useToast();
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "コメントを入力してください。",
      });
      return;
    }

    try {
      await createComment.mutateAsync({
        analysisId,
        content: newComment,
      });

      setNewComment("");
      toast({
        title: "成功",
        description: "コメントを追加しました。",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          コメント
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力..."
            className="min-h-[100px]"
          />
          <Button
            type="submit"
            disabled={createComment.isPending}
            className="w-full"
          >
            {createComment.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            コメントを追加
          </Button>
        </form>

        <div className="space-y-4">
          {comments?.map((comment) => (
            <div
              key={comment.id}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {comment.user_id === user?.id ? "あなた" : "ユーザー"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(comment.created_at), "PPP")}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
