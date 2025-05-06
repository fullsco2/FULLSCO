import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة الدول | FULLSCO Admin',
  description: 'لوحة تحكم إدارة الدول في منصة FULLSCO',
};

export default function CountriesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة الدول</h1>
        <button 
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span className="i-lucide-plus-circle h-4 w-4" />
          إضافة دولة جديدة
        </button>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">قائمة الدول</h2>
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
                <th className="py-3 px-4 text-start font-medium text-right">الرمز</th>
                <th className="py-3 px-4 text-start font-medium text-right">العلم</th>
                <th className="py-3 px-4 text-start font-medium text-right">عدد المنح الدراسية</th>
                <th className="py-3 px-4 text-start font-medium text-right">الحالة</th>
                <th className="py-3 px-4 text-start font-medium text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center overflow-hidden">
                      <span className="text-xl">🇬🇧</span>
                    </div>
                    <div>
                      <p className="font-medium">بريطانيا</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">GB</td>
                <td className="py-3 px-4 text-center"><span className="text-xl">🇬🇧</span></td>
                <td className="py-3 px-4">27</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    منشور
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-md hover:bg-accent">
                      <span className="i-lucide-pencil h-4 w-4" />
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
                    <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center overflow-hidden">
                      <span className="text-xl">🇺🇸</span>
                    </div>
                    <div>
                      <p className="font-medium">الولايات المتحدة</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">US</td>
                <td className="py-3 px-4 text-center"><span className="text-xl">🇺🇸</span></td>
                <td className="py-3 px-4">35</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    منشور
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-md hover:bg-accent">
                      <span className="i-lucide-pencil h-4 w-4" />
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
                    <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center overflow-hidden">
                      <span className="text-xl">🇩🇪</span>
                    </div>
                    <div>
                      <p className="font-medium">ألمانيا</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">DE</td>
                <td className="py-3 px-4 text-center"><span className="text-xl">🇩🇪</span></td>
                <td className="py-3 px-4">24</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    منشور
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-md hover:bg-accent">
                      <span className="i-lucide-pencil h-4 w-4" />
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
            عرض 1-3 من 15 دولة
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md border disabled:opacity-50 disabled:pointer-events-none">
              <span className="i-lucide-chevron-right h-4 w-4" />
            </button>
            <button className="p-2 rounded-md border bg-primary text-primary-foreground">
              1
            </button>
            <button className="p-2 rounded-md border hover:bg-accent">
              2
            </button>
            <button className="p-2 rounded-md border hover:bg-accent">
              3
            </button>
            <button className="p-2 rounded-md border hover:bg-accent">
              <span className="i-lucide-more-horizontal h-4 w-4" />
            </button>
            <button className="p-2 rounded-md border hover:bg-accent">
              5
            </button>
            <button className="p-2 rounded-md border hover:bg-accent disabled:opacity-50 disabled:pointer-events-none">
              <span className="i-lucide-chevron-left h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
