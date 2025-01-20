import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Concept } from "@db/schema";

interface GenerateConceptInput {
  analysis_ids: string[];
}

interface RefineConceptInput {
  id: string;
  conditions: {
    budget?: string;
    timeline?: string;
    resources?: string;
    preferences?: string;
  };
}

export function useConcepts() {
  return useQuery<Concept[]>({
    queryKey: ["/api/concepts"],
  });
}

export function useConcept(id: string) {
  return useQuery<Concept>({
    queryKey: [`/api/concepts/${id}`],
    enabled: id !== "new",
  });
}

export function useGenerateConcept() {
  const queryClient = useQueryClient();

  return useMutation<Concept, Error, GenerateConceptInput>({
    mutationFn: async (data) => {
      const res = await fetch("/api/concepts/generate", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/concepts"] });
    },
  });
}

export function useRefineConcept() {
  const queryClient = useQueryClient();

  return useMutation<Concept, Error, RefineConceptInput>({
    mutationFn: async ({ id, conditions }) => {
      const res = await fetch(`/api/concepts/${id}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conditions }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/concepts/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/concepts"] });
    },
  });
}

export function useDeleteConcept() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/concepts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/concepts"] });
    },
  });
}