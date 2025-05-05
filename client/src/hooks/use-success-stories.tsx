import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SuccessStory, InsertSuccessStory } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

type SuccessStoriesContextType = {
  successStories: SuccessStory[];
  isLoading: boolean;
  error: Error | null;
  getSuccessStory: (id: number) => SuccessStory | undefined;
  deleteSuccessStory: (id: number) => Promise<void>;
  updateSuccessStoryStatus: (id: number, isPublished: boolean) => Promise<void>;
};

// شرح: تعريف نوع بيانات معلومات قصص النجاح التي سنوفرها في المزود
export const SuccessStoriesContext = createContext<SuccessStoriesContextType | null>(null);

export function SuccessStoriesProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  
  // جلب جميع قصص النجاح
  const {
    data: successStoriesResponse,
    error,
    isLoading,
  } = useQuery<{ success: boolean, data: SuccessStory[] }, Error>({
    queryKey: ["/api/success-stories"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // استخراج قصص النجاح من بيانات الاستجابة
  const successStories = successStoriesResponse?.data || [];

  // حذف قصة نجاح
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/success-stories/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("فشلت عملية الحذف");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/success-stories"] });
    },
  });

  // تحديث حالة النشر
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number; isPublished: boolean }) => {
      const response = await fetch(`/api/success-stories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished }),
      });
      if (!response.ok) {
        throw new Error("فشلت عملية تحديث الحالة");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/success-stories"] });
    },
  });

  // العثور على قصة نجاح بواسطة المعرف
  const getSuccessStory = (id: number) => {
    return successStories.find(story => story.id === id);
  };

  // حذف قصة نجاح
  const deleteSuccessStory = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  // تحديث حالة النشر
  const updateSuccessStoryStatus = async (id: number, isPublished: boolean) => {
    await updateStatusMutation.mutateAsync({ id, isPublished });
  };

  return (
    <SuccessStoriesContext.Provider
      value={{
        successStories,
        isLoading,
        error: error || null,
        getSuccessStory,
        deleteSuccessStory,
        updateSuccessStoryStatus,
      }}
    >
      {children}
    </SuccessStoriesContext.Provider>
  );
}

export function useSuccessStories() {
  const context = useContext(SuccessStoriesContext);
  if (!context) {
    throw new Error("useSuccessStories must be used within a SuccessStoriesProvider");
  }
  return context;
}

// هوك للحصول على قصة نجاح واحدة
export function useSuccessStory(id: number) {
  const { data: successStoryResponse, isLoading, error } = useQuery<{ success: boolean, data: SuccessStory } | SuccessStory>({
    queryKey: ["/api/success-stories", id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!id,
  });

  // استخراج قصة النجاح من البيانات المستجابة
  const successStory = (successStoryResponse && 'data' in successStoryResponse) 
    ? successStoryResponse.data 
    : successStoryResponse;

  return {
    successStory,
    isLoading,
    error,
  };
}

// هوك لإنشاء قصة نجاح جديدة
export function useCreateSuccessStory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<InsertSuccessStory, "id" | "createdAt">) => {
      const response = await fetch("/api/success-stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشلت عملية الإنشاء");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/success-stories"] });
    },
  });
}

// هوك لتحديث قصة نجاح
export function useUpdateSuccessStory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSuccessStory> }) => {
      const response = await fetch(`/api/success-stories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشلت عملية التحديث");
      }
      
      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/success-stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/success-stories", variables.id] });
    },
  });
}