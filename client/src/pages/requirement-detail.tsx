import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "wouter";
import { useMutation } from "@tanstack/react-query";

export default function RequirementDetail({ requirement }) {
  const { toast } = useToast();
  const [, navigate] = useNavigate();

  const deleteRequirementMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/requirements/${requirement.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    onSuccess: () => {
      toast({
        title: "要件書を削除しました",
        description: "要件書が正常に削除されました",
      });
      navigate("/requirements");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message,
      });
    },
  });

  return (
    <Card>
      <CardHeader className="relative">
        <div className="absolute top-4 right-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>要件書の削除</AlertDialogTitle>
                <AlertDialogDescription>
                  この要件書を削除してもよろしいですか？この操作は取り消せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteRequirementMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteRequirementMutation.isPending}
                >
                  {deleteRequirementMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  削除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <CardTitle>{requirement.title}</CardTitle>
        <CardDescription>要件書の詳細情報</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">概要</h3>
            <p className="text-muted-foreground">{requirement.overview}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">対象ユーザー</h3>
            <p className="text-muted-foreground">{requirement.target_users}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">機能一覧</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {JSON.parse(requirement.features).map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium">技術スタック</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {JSON.parse(requirement.tech_stack).map((tech: string, index: number) => (
                <li key={index}>{tech}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          作成日: {new Date(requirement.created_at).toLocaleDateString("ja-JP")}
        </p>
      </CardFooter>
    </Card>
  );
}