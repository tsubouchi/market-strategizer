import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Analysis } from "@db/schema";

interface AnalysisInput {
  analysis_type: string;
  content: Record<string, any>;
}

export function useAnalyses() {
  return useQuery<Analysis[]>({
    queryKey: ["/api/analyses"],
  });
}

export function useAnalysis(id: string) {
  return useQuery<Analysis>({
    queryKey: [`/api/analyses/${id}`],
  });
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation<Analysis, Error, AnalysisInput>({
    mutationFn: async (data) => {
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
