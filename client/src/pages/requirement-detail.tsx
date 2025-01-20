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
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Requirement {
  id: string;
  title: string;
  overview: string;
  target_users: string;
  features: string;
  tech_stack: string;
  created_at: string;
}

export default function RequirementDetail({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // 要件書データの取得
  const { data: requirement, isLoading } = useQuery<Requirement>({
    queryKey: [`/api/requirements/${params.id}`],
  });

  const deleteRequirementMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/requirements/${params.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
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
      navigate("/concepts");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Skeleton className="h-6 w-[100px] mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div>
              <Skeleton className="h-6 w-[150px] mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!requirement) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          要件書が見つかりません
        </div>
      </Card>
    );
  }

  // Parse JSON strings
  const features = JSON.parse(requirement.features);
  const techStack = JSON.parse(requirement.tech_stack);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="relative">
        <div className="absolute top-6 right-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" className="h-9 w-9">
                <Trash2 className="h-5 w-5" />
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
        <CardTitle className="text-2xl font-bold mb-2">{requirement.title}</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">要件書の詳細情報</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">概要</h3>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{requirement.overview}</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">対象ユーザー</h3>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{requirement.target_users}</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">機能一覧</h3>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground">
              {features.map((feature: string, index: number) => (
                <li key={index} className="ml-4">{feature}</li>
              ))}
            </ul>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">技術スタック</h3>
            <ul className="list-disc list-inside space-y-3 text-muted-foreground">
              {techStack.map((tech: string, index: number) => (
                <li key={index} className="ml-4">{tech}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center py-6 px-6 bg-muted/5">
        <p className="text-sm text-muted-foreground">
          作成日: {new Date(requirement.created_at).toLocaleDateString("ja-JP")}
        </p>
      </CardFooter>
    </Card>
  );
}