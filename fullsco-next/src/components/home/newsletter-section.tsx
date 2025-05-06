'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Check, Loader2, X } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';

export function NewsletterSection() {
  const { siteSettings } = useSiteSettings();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!siteSettings || !siteSettings.showNewsletterSection) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');
    
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage('تم الاشتراك بنجاح! سوف تصلك أحدث المنح والفرص.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'حدث خطأ أثناء الاشتراك، يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('حدث خطأ أثناء الاشتراك، يرجى المحاولة مرة أخرى.');
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-primary/5">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block p-3 mb-4 rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl mb-2">
            {siteSettings.newsletterSectionTitle || 'النشرة البريدية'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {siteSettings.newsletterSectionDescription || 'اشترك ليصلك كل جديد عن المنح الدراسية'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-4 pr-10 py-6"
                disabled={isSubmitting}
                aria-label="البريد الإلكتروني"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="h-12">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الاشتراك...
                </>
              ) : 'اشترك الآن'}
            </Button>
          </form>

          {status === 'success' && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center justify-center">
              <Check className="mr-2 h-4 w-4" />
              {message}
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-center">
              <X className="mr-2 h-4 w-4" />
              {message}
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-6">
            نحن نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.
          </p>
        </div>
      </div>
    </section>
  );
}
