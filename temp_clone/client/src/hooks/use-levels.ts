import { useQuery } from "@tanstack/react-query";

export function useLevels() {
  return useQuery({
    queryKey: ['/api/levels'],
    refetchOnWindowFocus: false
  });
}

export function useLevel(id: number) {
  return useQuery({
    queryKey: ['/api/levels', id],
    enabled: !!id,
    refetchOnWindowFocus: false
  });
}