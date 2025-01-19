import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Analysis } from "@db/schema";

interface AnalysisInput {
  analysis_type: string;
  content: Record<string, any>;
  reference_url?: string;
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