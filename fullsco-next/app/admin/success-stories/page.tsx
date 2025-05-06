import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة قصص النجاح | FULLSCO Admin',
  description: 'لوحة تحكم إدارة قصص النجاح في منصة FULLSCO',
};

export default function SuccessStoriesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة قصص النجاح</h1>
        <button 
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span className="i-lucide-plus-circle h-4 w-4" />
          إضافة قصة جديدة
        </button>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">قائمة قصص النجاح</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث..."
                  className="w-64 rounded-md border border-input px-3 py-2 text-sm pl-9"
                />
                <span className="i-lucide-search h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              </div>
              <button className="p-2 rounded-md hover:bg-accent">
                <span className="i-lucide-filter h-4 w-4" />
              </button>
              <button className="p-2 rounded-md hover:bg-accent">
                <span className="i-lucide-refresh-cw h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-start font-medium text-right">الاسم</th>
                <th className="py-3 px-4 text-start font-medium text-right">التصنيف</th>
                <th className="py-3 px-4 text-start font-medium text-right">الجامعة</th>
                <th className="py-3 px-4 text-start font-medium text-right">البلد</th>
                <th className="py-3 px-4 text-start font-medium text-right">الحالة</th>
                <th className="py-3 px-4 text-start font-medium text-right">التاريخ</th>
                <th className="py-3 px-4 text-start font-medium text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-secondary/20 rounded-full flex items-center justify-center">
                      <span className="i-lucide-user h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">أحمد محمد</p>
                      <p className="text-sm text-muted-foreground">من السودان إلى ألمانيا</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">علوم الحاسوب</td>
                <td className="py-3 px-4">جامعة برلين التقنية</td>
                <td className="py-3 px-4">ألمانيا</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    منشور
                  </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">2023-05-15</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-md hover:bg-accent">
                      <span className="i-lucide-pencil h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-accent">
                      <span className="i-lucide-eye h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-accent text-destructive">
                      <span className="i-lucide-trash-2 h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-secondary/20 rounded-full flex items-center justify-center">
                      <span className="i-lucide-user h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">سارة علي</p>
                      <p className="text-sm text-muted-foreground">من مصر إلى ماليزيا</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">الطب</td>
                <td className="py-3 px-4">جامعة ماليزيا الطبية</td>
                <td className="py-3 px-4">ماليزيا</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    منشور
                  </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">2023-06-20</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-md hover:bg-accent">
                      <span className="i-lucide-pencil h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-accent">
                      <span className="i-lucide-eye h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-accent text-destructive">
                      <span className="i-lucide-trash-2 h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-secondary/20 rounded-full flex items-center justify-center">
                      <span className="i-lucide-user h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">محمد عبدالله</p>
                      <p className="text-sm text-muted-foreground">من الأردن إلى كندا</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">الهندسة المدنية</td>
                <td className="py-3 px-4">جامعة تورنتو</td>
                <td className="py-3 px-4">كندا</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    مسودة
                  </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">2023-07-10</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-md hover:bg-accent">
                      <span className="i-lucide-pencil h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-accent">
                      <span className="i-lucide-eye h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-accent text-destructive">
                      <span className="i-lucide-trash-2 h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            عرض 1-3 من 3 قصص
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md border disabled:opacity-50 disabled:pointer-events-none">
              <span className="i-lucide-chevron-right h-4 w-4" />
            </button>
            <button className="p-2 rounded-md border bg-primary text-primary-foreground">
              1
            </button>
            <button className="p-2 rounded-md border disabled:opacity-50 disabled:pointer-events-none">
              <span className="i-lucide-chevron-left h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
