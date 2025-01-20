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
import { Download, Trash2, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface Requirement {
  id: string;
  title: string;
  overview: string;
  target_users: string;
  features: string;
  tech_stack: string;
  created_at: string;
}

export default function RequirementsDetail({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: requirement, isLoading } = useQuery<Requirement>({
    queryKey: [`/api/requirements/${params.id}`],
  });

  // Fetch markdown content
  const { data: markdownContent, isLoading: isLoadingMarkdown } = useQuery<string>({
    queryKey: [`/api/requirements/${params.id}/download`],
    select: (data) => data,
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
      navigate("/requirements-history");
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

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Card className="w-full">
        <CardHeader className="relative">
          <div className="absolute top-6 right-6 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.location.href = `/api/requirements/${params.id}/download`}
              title="ダウンロード"
            >
              <Download className="h-5 w-5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="hover:bg-destructive/10 hover:text-destructive">
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
                    className="bg-destructive/90 text-destructive-foreground hover:bg-destructive"
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
      </Card>

      {/* Markdown Preview with Syntax Highlighting */}
      <Card>
        <CardHeader>
          <CardTitle>要件書プレビュー</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          {isLoadingMarkdown ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {markdownContent || ''}
            </ReactMarkdown>
          )}
        </CardContent>
      </Card>
    </div>
  );
}