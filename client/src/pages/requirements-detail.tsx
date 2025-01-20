import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MarkdownResponse {
  html: string;
}

export default function RequirementsDetail() {
  const [location] = useLocation();
  const id = location.split("/").pop();

  const { data: response, isLoading } = useQuery<MarkdownResponse>({
    queryKey: [`/api/requirements/${id}/markdown`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent className="pt-6 prose prose-slate max-w-none">
          <div dangerouslySetInnerHTML={{ __html: response?.html || "" }} />
        </CardContent>
      </Card>
    </div>
  );
}