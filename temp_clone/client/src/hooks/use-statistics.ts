import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Statistic } from "@shared/schema";

export interface StatisticData {
  id: number;
  title: string;
  value: string;
  description?: string;
  icon: string;
  color?: string;
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StatisticsResponse {
  success: boolean;
  message: string;
  data: StatisticData[];
}

export function useStatistics() {
  const { 
    data: response, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery<StatisticsResponse>({
    queryKey: ['/api/statistics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/statistics?active=true');
      return response.json();
    },
  });
  
  // استخراج البيانات من داخل كائن الاستجابة أو إرجاع مصفوفة فارغة إذا لم تكن البيانات متوفرة
  const statistics = response?.data || [];
  
  return {
    statistics,
    isLoading,
    isError,
    error,
    refetch
  };
}