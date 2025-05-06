import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FULLSCO - منصة المنح الدراسية',
  description: 'أكبر منصة للمنح الدراسية للطلاب العرب تتضمن منح دراسية و فرص متنوعة',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="py-24 text-center">
        <h1 className="text-4xl font-bold mb-6">منصة FULLSCO للمنح الدراسية</h1>
        <p className="text-xl mb-8">اكتشف آلاف المنح الدراسية والفرص التعليمية حول العالم</p>
        <div className="flex justify-center gap-4">
          <a href="/scholarships" className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">استكشف المنح</a>
          <a href="/articles" className="bg-secondary text-white px-6 py-3 rounded-md hover:bg-secondary/90 transition-colors">اقرأ المقالات</a>
        </div>
      </section>
      
      <section className="py-12 bg-muted">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">منح دراسية مميزة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">منحة الماجستير في الهندسة</h3>
              <p className="text-muted-foreground mb-4">منحة ممولة بالكامل للدراسة في أفضل الجامعات</p>
              <a href="#" className="text-primary hover:underline">التفاصيل</a>
            </div>
            <div className="bg-background rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">منحة البكالوريوس في الإدارة</h3>
              <p className="text-muted-foreground mb-4">برنامج تبادل ثقافي للدراسة في الخارج</p>
              <a href="#" className="text-primary hover:underline">التفاصيل</a>
            </div>
            <div className="bg-background rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">منحة البحث العلمي</h3>
              <p className="text-muted-foreground mb-4">برنامج بحثي ممول للباحثين العرب</p>
              <a href="#" className="text-primary hover:underline">التفاصيل</a>
            </div>
          </div>
          <div className="text-center mt-8">
            <a href="/scholarships" className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors inline-block">عرض جميع المنح</a>
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">كيف تحصل على منحة دراسية؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">ابحث عن المنح المناسبة</h3>
              <p className="text-muted-foreground">استخدم منصتنا للتصفية حسب المؤهل والتخصص</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">جهز ملفك</h3>
              <p className="text-muted-foreground">جهز المستندات المطلوبة للتقديم</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">قدم للمنحة</h3>
              <p className="text-muted-foreground">اتبع تعليمات التقديم بدقة</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">استعد للدراسة</h3>
              <p className="text-muted-foreground">بعد القبول، استعد لبدء رحلتك التعليمية</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12 bg-muted">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">آخر المقالات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">كيفية كتابة خطاب الدافع للمنح الدراسية</h3>
                <p className="text-muted-foreground mb-4">إرشادات مهمة لكتابة خطاب دافع قوي للمنح الدراسية</p>
                <a href="#" className="text-primary hover:underline">قراءة المقال</a>
              </div>
            </div>
            <div className="bg-background rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">أفضل الجامعات لدراسة الهندسة</h3>
                <p className="text-muted-foreground mb-4">دليل شامل لأفضل الجامعات العالمية لدراسة الهندسة</p>
                <a href="#" className="text-primary hover:underline">قراءة المقال</a>
              </div>
            </div>
            <div className="bg-background rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">نصائح للدراسة في الخارج</h3>
                <p className="text-muted-foreground mb-4">نصائح عملية للطلاب الذين يخططون للدراسة في الخارج</p>
                <a href="#" className="text-primary hover:underline">قراءة المقال</a>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <a href="/articles" className="bg-secondary text-white px-6 py-3 rounded-md hover:bg-secondary/90 transition-colors inline-block">عرض جميع المقالات</a>
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">اشترك في النشرة البريدية</h2>
          <div className="max-w-md mx-auto">
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="البريد الإلكتروني" 
                className="flex-1 rounded-md border border-input px-4 py-2"
              />
              <button 
                type="submit" 
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                اشتراك
              </button>
            </form>
            <p className="text-muted-foreground text-sm mt-2">اشترك للحصول على آخر المنح والمقالات</p>
          </div>
        </div>
      </section>
    </main>
  );
}
