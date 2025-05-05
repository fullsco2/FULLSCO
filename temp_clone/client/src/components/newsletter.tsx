import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Mail, Check, AlertCircle, Star, BellRing, BookOpen, Zap, BellDot } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const subscribe = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest('POST', '/api/subscribers', { email });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الاشتراك بنجاح!",
        description: "أنت الآن مشترك في نشرتنا البريدية.",
        variant: "default",
      });
      setEmail('');
      // تحديث قائمة المشتركين في لوحة الإدارة
      queryClient.invalidateQueries({ queryKey: ['/api/subscribers'] });
    },
    onError: (error: any) => {
      toast({
        title: "فشل الاشتراك",
        description: error.message || "ربما تكون مشتركاً بالفعل بهذا البريد الإلكتروني.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribe.mutate(email);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-accent/90 py-20">
      {/* زخارف خلفية */}
      <div className="pointer-events-none absolute inset-0">
        {/* الدوائر المتدرجة في الخلفية */}
        <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-white/5 blur-2xl"></div>
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute left-1/3 top-1/4 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
        
        {/* نمط شبكي في الخلفية */}
        <div className="absolute inset-0 z-0 opacity-5">
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="newsletter-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="1" height="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#newsletter-grid)" />
          </svg>
        </div>
      </div>
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center lg:flex-row lg:gap-12">
            {/* النص والعنوان */}
            <div className="mb-10 lg:mb-0 lg:w-1/2">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-white/10 p-3 backdrop-blur-sm">
                <Mail className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="mb-6 text-3xl font-bold leading-tight text-white sm:text-4xl">
                احصل على أحدث فرص المنح الدراسية
              </h2>
              
              <p className="mb-6 text-lg text-white/90">
                اشترك في نشرتنا البريدية ولا تفوت أي موعد نهائي للتقديم على المنح. احصل على نصائح الخبراء والتوجيه مباشرة إلى بريدك الإلكتروني.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                    <BellRing className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/90">تنبيهات حصرية عن المنح الدراسية الجديدة</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                    <Star className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/90">منح دراسية مميزة وفرص نادرة</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                    <BookOpen className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/90">دليل لكيفية التقديم وزيادة فرصك في القبول</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* نموذج الاشتراك */}
            <div className="w-full lg:w-1/2">
              <div className="relative overflow-hidden rounded-2xl bg-white/10 p-8 shadow-xl backdrop-blur-sm">
                <div className="absolute -right-4 top-0 h-24 w-24 rotate-45 bg-gradient-to-r from-accent to-primary/40 blur-2xl"></div>
                
                <div className="relative">
                  <h3 className="mb-2 text-xl font-bold text-white">اشترك الآن</h3>
                  <p className="mb-6 text-sm text-white/80">احصل على تحديثات أسبوعية عن أفضل المنح المتاحة</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        className="h-12 w-full rounded-lg border-0 bg-white/80 px-5 text-gray-900 shadow-sm backdrop-blur-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/50 pr-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        dir="ltr"
                      />
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="hover:bg-accent-gold hover:text-rich-black group w-full rounded-lg bg-white px-6 py-3 font-medium text-accent shadow-md transition-all hover:shadow-accent/20"
                      disabled={subscribe.isPending}
                    >
                      {subscribe.isPending ? (
                        <span className="flex items-center justify-center">
                          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent"></span>
                          جاري الاشتراك...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <BellDot className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                          اشترك في النشرة البريدية
                        </span>
                      )}
                    </Button>
                  </form>
                  
                  {/* حالات العرض */}
                  {subscribe.isSuccess && (
                    <div className="mt-4 flex items-center rounded-md bg-white/90 p-3 text-green-700 text-right shadow-sm">
                      <Check className="ml-2 h-5 w-5 text-green-600" />
                      <span>تم الاشتراك بنجاح! تابع بريدك الإلكتروني للحصول على أحدث المنح والفرص.</span>
                    </div>
                  )}
                  
                  {subscribe.isError && (
                    <div className="mt-4 flex items-center rounded-md bg-white/90 p-3 text-red-700 text-right shadow-sm">
                      <AlertCircle className="ml-2 h-5 w-5 text-red-600" />
                      <span>حدث خطأ أثناء الاشتراك. قد تكون مشتركاً بالفعل أو يرجى التحقق من صحة البريد الإلكتروني.</span>
                    </div>
                  )}
                  
                  <p className="mt-6 text-center text-xs text-white/70">
                    بالاشتراك، فإنك توافق على <a href="#" className="underline">سياسة الخصوصية</a> وتوافق على تلقي تحديثات عن المنح الدراسية.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
