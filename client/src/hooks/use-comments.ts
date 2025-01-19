import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Comment } from "@db/schema";

interface CreateCommentInput {
  analysisId: string;
  content: string;
}

export function useComments(analysisId: string) {
  return useQuery<Comment[]>({
    queryKey: [`/api/analyses/${analysisId}/comments`],
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation<Comment, Error, CreateCommentInput>({
    mutationFn: async ({ analysisId, content }) => {
      const res = await fetch(`/api/analyses/${analysisId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: (_, { analysisId }) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/analyses/${analysisId}/comments`],
      });
    },
  });
}
