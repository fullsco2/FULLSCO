import { useQuery } from "@tanstack/react-query";

export function useCategories() {
  return useQuery({
    queryKey: ['/api/categories'],
    refetchOnWindowFocus: false
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: ['/api/categories', id],
    enabled: !!id,
    refetchOnWindowFocus: false
  });
}