import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Analysis } from "@db/schema";

interface AnalysisInput {
  analysis_type: string;
  content: Record<string, any>;
  reference_url?: string;
}

interface UpdateVisibilityInput {
  id: string;
  is_public: boolean;
}

export function useAnalyses() {
  return useQuery<Analysis[]>({
    queryKey: ["/api/analyses"],
  });
}

export function useAnalysis(id: string) {
  return useQuery<Analysis>({
    queryKey: [`/api/analyses/${id}`],
    enabled: id !== "new",
  });
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation<Analysis, Error, FormData>({
    mutationFn: async (data) => {
      const res = await fetch("/api/analyses", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
    },
  });
}

export function useUpdateAnalysisVisibility() {
  const queryClient = useQueryClient();

  return useMutation<Analysis, Error, UpdateVisibilityInput>({
    mutationFn: async ({ id, is_public }) => {
      const res = await fetch(`/api/analyses/${id}/visibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/analyses/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
    },
  });
}