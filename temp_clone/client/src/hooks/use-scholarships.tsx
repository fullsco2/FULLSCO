import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Scholarship } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

type ScholarshipsContextType = {
  scholarships: Scholarship[];
  featuredScholarships: Scholarship[];
  isLoading: boolean;
  error: Error | null;
};

// استجابة API للمنح الدراسية
interface ScholarshipsResponse {
  success: boolean;
  data: Scholarship[];
  message?: string;
}

export const ScholarshipsContext = createContext<ScholarshipsContextType | null>(null);

export function ScholarshipsProvider({ children }: { children: ReactNode }) {
  const {
    data: scholarshipsResponse,
    error: scholarshipsError,
    isLoading: scholarshipsLoading,
  } = useQuery<ScholarshipsResponse, Error>({
    queryKey: ["/api/scholarships"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // استخراج المنح الدراسية من الاستجابة
  const scholarships = scholarshipsResponse?.success && Array.isArray(scholarshipsResponse.data) 
    ? scholarshipsResponse.data 
    : [];

  const {
    data: featuredScholarshipsData = [],
    error: featuredError,
    isLoading: featuredLoading,
  } = useQuery<Scholarship[], Error>({
    queryKey: ["/api/scholarships/featured"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // المنح المميزة تأتي مباشرة كمصفوفة بدون success/data
  const featuredScholarships = featuredScholarshipsData || [];

  // Combine errors
  const error = scholarshipsError || featuredError;
  const isLoading = scholarshipsLoading || featuredLoading;

  return (
    <ScholarshipsContext.Provider
      value={{
        scholarships,
        featuredScholarships,
        isLoading,
        error: error || null,
      }}
    >
      {children}
    </ScholarshipsContext.Provider>
  );
}

export function useScholarships() {
  const context = useContext(ScholarshipsContext);
  if (!context) {
    throw new Error("useScholarships must be used within a ScholarshipsProvider");
  }
  return context;
}