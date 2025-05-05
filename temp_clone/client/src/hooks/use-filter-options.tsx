import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Category, Country, Level } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

type FilterOptionsContextType = {
  categories: Category[];
  countries: Country[];
  levels: Level[];
  isLoading: boolean;
  error: Error | null;
};

// شرح: تعريف نوع بيانات خيارات الفلترة التي سنوفرها في المزود
export const FilterOptionsContext = createContext<FilterOptionsContextType | null>(null);

export function FilterOptionsProvider({ children }: { children: ReactNode }) {
  // جلب الفئات
  const {
    data: categories = [],
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useQuery<Category[], Error>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // جلب الدول
  const {
    data: countries = [],
    error: countriesError,
    isLoading: countriesLoading,
  } = useQuery<Country[], Error>({
    queryKey: ["/api/countries"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // جلب المستويات التعليمية
  const {
    data: levels = [],
    error: levelsError,
    isLoading: levelsLoading,
  } = useQuery<Level[], Error>({
    queryKey: ["/api/levels"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // تجميع حالات التحميل والأخطاء
  const isLoading = categoriesLoading || countriesLoading || levelsLoading;
  const error = categoriesError || countriesError || levelsError;

  return (
    <FilterOptionsContext.Provider
      value={{
        categories,
        countries,
        levels,
        isLoading,
        error: error || null,
      }}
    >
      {children}
    </FilterOptionsContext.Provider>
  );
}

export function useFilterOptions() {
  const context = useContext(FilterOptionsContext);
  if (!context) {
    throw new Error("useFilterOptions must be used within a FilterOptionsProvider");
  }
  return context;
}