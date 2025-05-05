import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BellRing, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// نوع الإشعار
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// واجهة الإشعار
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// واجهة سياق الإشعارات
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  deleteAllNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  isLoading: boolean;
  refetch: () => void;
}

// إنشاء سياق الإشعارات
const NotificationContext = createContext<NotificationContextType | null>(null);

// مزود الإشعارات
export function NotificationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  
  // استرجاع الإشعارات من الخادم
  const { data: notifications = [], isLoading, refetch } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      try {
        // سيتم إضافة نقطة نهاية API لاحقًا - في الوقت الحالي استخدم بيانات تجريبية للتطوير
        // const response = await fetch('/api/notifications');
        // if (!response.ok) throw new Error('فشل في استلام الإشعارات');
        // return response.json();
        
        // بيانات تجريبية للعرض أثناء التطوير
        return [
          {
            id: 1,
            title: 'تمت إضافة منحة جديدة',
            message: 'تمت إضافة منحة "منحة جامعة هارفارد 2025" بنجاح.',
            type: 'success',
            isRead: false,
            link: '/admin/scholarships',
            createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // قبل 15 دقيقة
          },
          {
            id: 2,
            title: 'مستخدم جديد مسجل',
            message: 'قام المستخدم "محمد أحمد" بالتسجيل في الموقع.',
            type: 'info',
            isRead: true,
            link: '/admin/users',
            createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // قبل ساعتين
          },
          {
            id: 3,
            title: 'محاولة تسجيل دخول فاشلة',
            message: 'هناك محاولات متعددة لتسجيل الدخول من عنوان IP غير معروف.',
            type: 'warning',
            isRead: false,
            createdAt: new Date(Date.now() - 45 * 60000).toISOString(), // قبل 45 دقيقة
          },
          {
            id: 4,
            title: 'تحذير أمان',
            message: 'تم تسجيل الدخول إلى حسابك من جهاز جديد.',
            type: 'error',
            isRead: false,
            createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // قبل 30 دقيقة
          },
          {
            id: 5,
            title: 'تم تحديث النظام',
            message: 'تم تثبيت التحديث الأخير للنظام بنجاح.',
            type: 'info',
            isRead: true,
            createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(), // قبل يوم
          },
        ] as Notification[];
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    },
    refetchInterval: 300000, // إعادة الاستعلام كل 5 دقائق
  });
  
  // عدد الإشعارات غير المقروءة
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  // وضع علامة "مقروء" على إشعار
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/notifications/${id}/read`, {
      //   method: 'PUT',
      // });
      // if (!response.ok) throw new Error('فشل في وضع علامة "مقروء" على الإشعار');
      // return response.json();
      
      // محاكاة استجابة API
      return { success: true, id };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/notifications'], (old: Notification[] | undefined) => 
        (old || []).map(notification => 
          notification.id === data.id ? { ...notification, isRead: true } : notification
        )
      );
    },
    onError: (error) => {
      toast({
        title: 'خطأ!',
        description: `فشل في وضع علامة "مقروء" على الإشعار: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // وضع علامة "مقروء" على جميع الإشعارات
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/notifications/read-all`, {
      //   method: 'PUT',
      // });
      // if (!response.ok) throw new Error('فشل في وضع علامة "مقروء" على جميع الإشعارات');
      // return response.json();
      
      // محاكاة استجابة API
      return { success: true };
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/notifications'], (old: Notification[] | undefined) => 
        (old || []).map(notification => ({ ...notification, isRead: true }))
      );
    },
    onError: (error) => {
      toast({
        title: 'خطأ!',
        description: `فشل في وضع علامة "مقروء" على جميع الإشعارات: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // حذف إشعار
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/notifications/${id}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('فشل في حذف الإشعار');
      // return response.json();
      
      // محاكاة استجابة API
      return { success: true, id };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/notifications'], (old: Notification[] | undefined) => 
        (old || []).filter(notification => notification.id !== data.id)
      );
    },
    onError: (error) => {
      toast({
        title: 'خطأ!',
        description: `فشل في حذف الإشعار: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // حذف جميع الإشعارات
  const deleteAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/notifications`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('فشل في حذف جميع الإشعارات');
      // return response.json();
      
      // محاكاة استجابة API
      return { success: true };
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/notifications'], []);
    },
    onError: (error) => {
      toast({
        title: 'خطأ!',
        description: `فشل في حذف جميع الإشعارات: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // إضافة إشعار جديد
  const addNotificationMutation = useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/notifications`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notification),
      // });
      // if (!response.ok) throw new Error('فشل في إضافة إشعار جديد');
      // return response.json();
      
      // محاكاة استجابة API
      const now = new Date().toISOString();
      const id = Math.max(0, ...notifications.map(n => n.id)) + 1;
      
      return { 
        ...notification, 
        id, 
        isRead: false, 
        createdAt: now 
      } as Notification;
    },
    onSuccess: (newNotification) => {
      queryClient.setQueryData(['/api/notifications'], (old: Notification[] | undefined) => 
        [newNotification, ...(old || [])]
      );
    },
    onError: (error) => {
      toast({
        title: 'خطأ!',
        description: `فشل في إضافة إشعار جديد: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // وظائف الواجهة
  const markAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };
  
  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };
  
  const deleteNotification = (id: number) => {
    deleteNotificationMutation.mutate(id);
  };
  
  const deleteAllNotifications = () => {
    deleteAllNotificationsMutation.mutate();
  };
  
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    addNotificationMutation.mutate(notification);
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        addNotification,
        isLoading,
        refetch,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// هوك استخدام الإشعارات
export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('يجب استخدام useNotifications داخل NotificationProvider');
  }
  
  return context;
}

// تنسيق التاريخ النسبي
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'الآن';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `منذ ${diffInMinutes} ${diffInMinutes === 1 ? 'دقيقة' : 'دقائق'}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `منذ ${diffInHours} ${diffInHours === 1 ? 'ساعة' : 'ساعات'}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `منذ ${diffInDays} ${diffInDays === 1 ? 'يوم' : 'أيام'}`;
  }
  
  // إذا كان أقدم من 30 يومًا، أعد التاريخ الفعلي
  return date.toLocaleDateString('ar-SA');
}

// لون الإشعار حسب نوعه
function getNotificationColor(type: NotificationType) {
  switch (type) {
    case 'success':
      return 'bg-green-50 text-green-800 border-green-200';
    case 'warning':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'error':
      return 'bg-red-50 text-red-800 border-red-200';
    case 'info':
    default:
      return 'bg-blue-50 text-blue-800 border-blue-200';
  }
}

// مكون قائمة الإشعارات
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative" aria-label="الإشعارات">
          <BellRing className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-[5px] bg-primary text-primary-foreground text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">الإشعارات</div>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
                تعيين الكل كمقروء
              </Button>
              <Button variant="ghost" size="sm" onClick={deleteAllNotifications} className="h-8 text-xs">
                حذف الكل
              </Button>
            </div>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            <div className="flex justify-center mb-3">
              <BellRing className="h-10 w-10 text-muted" />
            </div>
            <p>لا توجد إشعارات حاليًا</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "px-4 py-3 border-b transition-colors",
                    !notification.isRead && "bg-muted/30",
                    getNotificationColor(notification.type)
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                      if (notification.link) {
                        window.location.href = notification.link;
                      }
                      setOpen(false);
                    }}>
                      <div className="font-semibold text-sm">{notification.title}</div>
                      <div className="text-sm">{notification.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </div>
                    </div>
                    <div className="flex gap-1 mt-1 mr-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => markAsRead(notification.id)}
                          title="تعيين كمقروء"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteNotification(notification.id)}
                        title="حذف"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}