import { useQuery } from "@tanstack/react-query";

export function useCountries() {
  return useQuery({
    queryKey: ['/api/countries'],
    refetchOnWindowFocus: false
  });
}

export function useCountry(id: number) {
  return useQuery({
    queryKey: ['/api/countries', id],
    enabled: !!id,
    refetchOnWindowFocus: false
  });
}