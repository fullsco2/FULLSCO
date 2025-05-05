import React from 'react';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function SiteSettingsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // إعادة توجيه المستخدم إلى صفحة الإعدادات الجديدة
  useEffect(() => {
    toast({
      title: "تم نقلك",
      description: "تم تحديث صفحة الإعدادات، وتم نقلك إلى الصفحة الجديدة للإعدادات"
    });
    
    // توجيه المستخدم إلى صفحة الإعدادات الجديدة
    navigate('/admin/settings');
  }, [navigate, toast]);
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <p>جاري توجيهك إلى صفحة الإعدادات الجديدة...</p>
    </div>
  );
}