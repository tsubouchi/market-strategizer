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
import { Trash2 } from "lucide-react";
import { useNavigate } from "wouter";
import { useMutation } from "@tanstack/react-query";

export default function RequirementDetail({ requirement }) {
  const { toast } = useToast();
  const navigate = useNavigate();

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
              <Button variant="ghost" size="icon">
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
                >
                  削除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <CardTitle>{requirement.title}</CardTitle>
        <CardDescription>要件書の詳細情報</CardDescription>
      </CardHeader>
      {/* 残りのカードコンテンツ */}
    </Card>
  );
}
