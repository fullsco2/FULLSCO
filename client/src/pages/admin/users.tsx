import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User } from '@shared/schema';
import AdminLayout from '@/components/admin/admin-layout';

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: usersResponse, isLoading } = useQuery<{ success: boolean, data: User[] }>({
    queryKey: ['/api/users'],
  });
  
  // استخراج المستخدمين من بيانات الاستجابة
  const users = usersResponse?.data || [];
  
  // تصفية المستخدمين بناءً على البحث
  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // زر إضافة مستخدم جديد
  const addUserButton = (
    <Button className="flex items-center shadow-soft">
      <span className="ml-2">+</span> إضافة مستخدم جديد
    </Button>
  );

  return (
    <AdminLayout title="إدارة المستخدمين">
      {/* Search & Controls */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">المستخدمين</h2>
        {addUserButton}
      </div>
      
      <Card className="mb-6">
        <CardHeader className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">بحث وتصفية</CardTitle>
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="بحث عن مستخدم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري تحميل البيانات...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery ? 'لا توجد نتائج مطابقة لبحثك' : 'لا يوجد مستخدمين حتى الآن'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم الكامل</TableHead>
                    <TableHead>اسم المستخدم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.fullName || 'غير محدد'}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt || '').toLocaleDateString('ar-EG')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}