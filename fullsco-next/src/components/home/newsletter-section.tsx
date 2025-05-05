'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsletterSectionProps {
  title?: string;
  description?: string;
}

export default function NewsletterSection({
  title = 'النشرة البريدية',
  description = 'اشترك ليصلك كل جديد عن المنح الدراسية',
}: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('يرجى إدخال عنوان البريد الإلكتروني');
      return;
    }
    
    // التحقق من صحة البريد الإلكتروني بطريقة بسيطة
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('يرجى إدخال عنوان بريد إلكتروني صحيح');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء الاشتراك');
      }
      
      setSuccess(true);
      setEmail('');
    } catch (err) {
      console.error('Error subscribing to newsletter:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-primary py-16 text-white md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-3 text-2xl font-bold md:text-3xl">{title}</h2>
          <p className="mb-8 text-white/90">{description}</p>
          
          <form onSubmit={handleSubmit} className="mx-auto max-w-xl">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                disabled={loading || success}
              />
              <Button
                type="submit"
                size="lg"
                className="gap-2 bg-white text-primary hover:bg-white/90 disabled:bg-white/70"
                disabled={loading || success}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    جاري الاشتراك...
                  </span>
                ) : success ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    تم الاشتراك
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    اشترك الآن
                  </span>
                )}
              </Button>
            </div>
            
            {error && (
              <div className="mt-3 flex items-center justify-center gap-1 rounded-md bg-red-500/20 p-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="mt-3 flex items-center justify-center gap-1 rounded-md bg-green-500/20 p-2 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>تم الاشتراك بنجاح! سيصلك آخر المستجدات على بريدك الإلكتروني.</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
