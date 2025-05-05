import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Mail, 
  Trash2, 
  Search, 
  Download, 
  MailQuestion, 
  MailWarning,
  CheckCircle,
  UserPlus,
  Filter,
  ChevronDown,
  RefreshCw,
  MoreHorizontal,
  XCircle,
  Send,
  Calendar
} from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// تحديد نوع المشترك
interface Subscriber {
  id: number;
  email: string;
  createdAt: string;
  status?: string; // 'active', 'inactive', 'bounced', etc.
  source?: string; // 'website', 'social', 'campaign', etc.
}

const AdminSubscribers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch subscribers
  const { data: subscribersResponse, isLoading } = useQuery<{ success: boolean, data: Subscriber[] }>({
    queryKey: ['/api/subscribers'],
  });
  
  // استخراج المشتركين من بيانات الاستجابة
  const subscribers = subscribersResponse?.data || [];

  // Delete subscriber mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/subscribers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('فشل في حذف المشترك');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscribers'] });
      toast({ 
        title: 'تم الحذف بنجاح', 
        description: 'تم حذف المشترك من النشرة البريدية' 
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: 'خطأ!', 
        description: `فشل في حذف المشترك: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // Filter subscribers
  const filteredSubscribers = Array.isArray(subscribers) 
    ? subscribers
        .filter(subscriber => subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(subscriber => statusFilter === 'all' || subscriber.status === statusFilter || 
          // إذا لم يكن هناك حالة محددة، نعتبرها نشطة
          (statusFilter === 'active' && !subscriber.status))
    : [];

  // إحصائيات سريعة عن المشتركين
  const subscriberStats = {
    total: Array.isArray(subscribers) ? subscribers.length : 0,
    active: Array.isArray(subscribers) ? subscribers.filter(s => !s.status || s.status === 'active').length : 0,
    inactive: Array.isArray(subscribers) ? subscribers.filter(s => s.status === 'inactive').length : 0,
    bounced: Array.isArray(subscribers) ? subscribers.filter(s => s.status === 'bounced').length : 0,
  };

  // معالجة تصدير البيانات
  const handleExportCSV = () => {
    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      toast({
        title: "لا توجد بيانات للتصدير",
        description: "لا يوجد مشتركين في قاعدة البيانات",
        variant: "destructive"
      });
      return;
    }

    // تهيئة بيانات CSV
    const headers = ["المعرف", "البريد الإلكتروني", "تاريخ الاشتراك", "الحالة"];
    const csvData = [
      headers.join(','),
      ...filteredSubscribers.map(s => 
        [
          s.id, 
          s.email, 
          new Date(s.createdAt).toLocaleDateString('ar-SA'),
          s.status || 'نشط'
        ].join(',')
      )
    ].join('\n');

    // إنشاء ملف للتنزيل
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "تم التصدير بنجاح",
      description: `تم تصدير بيانات ${filteredSubscribers.length} مشترك بنجاح`,
    });
  };

  // حذف مشترك
  const handleDeleteSubscriber = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setIsDeleteDialogOpen(true);
  };

  // تأكيد الحذف
  const confirmDelete = () => {
    if (selectedSubscriber) {
      deleteMutation.mutate(selectedSubscriber.id);
    }
  };

  // إجراءات في شريط الأدوات
  const actions = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExportCSV}>
        <Download className="ml-2 h-4 w-4" />
        تصدير CSV
      </Button>
      <Button>
        <Send className="ml-2 h-4 w-4" />
        إرسال رسالة
      </Button>
    </div>
  );
  
  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout title="إدارة المشتركين في النشرة البريدية" actions={actions}>
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-gray-800">
                  {subscriberStats.total}
                </h3>
                <p className="text-gray-500">إجمالي المشتركين</p>
              </div>
              <div className="mt-3">
                <Progress value={100} className="h-1.5 bg-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="bg-green-100 p-3 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-gray-800">
                  {subscriberStats.active}
                </h3>
                <p className="text-gray-500">مشتركين نشطين</p>
              </div>
              <div className="mt-3">
                <Progress 
                  value={subscriberStats.total > 0 ? (subscriberStats.active / subscriberStats.total) * 100 : 0} 
                  className="h-1.5 bg-green-100" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-amber-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="bg-amber-100 p-3 rounded-xl">
                  <MailQuestion className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-gray-800">
                  {subscriberStats.inactive}
                </h3>
                <p className="text-gray-500">مشتركين غير نشطين</p>
              </div>
              <div className="mt-3">
                <Progress 
                  value={subscriberStats.total > 0 ? (subscriberStats.inactive / subscriberStats.total) * 100 : 0} 
                  className="h-1.5 bg-amber-100" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-red-50 to-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="bg-red-100 p-3 rounded-xl">
                  <MailWarning className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-gray-800">
                  {subscriberStats.bounced}
                </h3>
                <p className="text-gray-500">بريد مرتد</p>
              </div>
              <div className="mt-3">
                <Progress 
                  value={subscriberStats.total > 0 ? (subscriberStats.bounced / subscriberStats.total) * 100 : 0} 
                  className="h-1.5 bg-red-100" 
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and Filter Panel */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المشتركين</CardTitle>
            <CardDescription>
              إدارة المشتركين في النشرة البريدية والرسائل الإخبارية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="بحث عن مشترك..."
                    className="pl-3 pr-9 w-full md:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      <Filter className="ml-2 h-4 w-4" />
                      فلترة حسب: {statusFilter === 'all' ? 'الكل' : statusFilter === 'active' ? 'نشط' : statusFilter === 'inactive' ? 'غير نشط' : 'مرتد'}
                      <ChevronDown className="mr-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      الكل
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                      نشط
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                      غير نشط
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('bounced')}>
                      مرتد
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/subscribers'] })}>
                  <RefreshCw className="ml-2 h-4 w-4" />
                  تحديث
                </Button>
                <Button variant="secondary">
                  <UserPlus className="ml-2 h-4 w-4" />
                  إضافة مشترك
                </Button>
              </div>
            </div>
            
            {/* Subscribers Table */}
            <div className="mt-6 border rounded-md">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 rtl:space-x-reverse">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium">لا يوجد مشتركين</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'لم يتم العثور على مشتركين مطابقين لمعايير البحث' 
                      : 'لا يوجد مشتركين في النشرة البريدية حتى الآن'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead className="min-w-[250px]">البريد الإلكتروني</TableHead>
                      <TableHead className="min-w-[200px]">تاريخ الاشتراك</TableHead>
                      <TableHead className="w-[100px]">الحالة</TableHead>
                      <TableHead className="w-[100px]">المصدر</TableHead>
                      <TableHead className="text-left w-[100px]">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((subscriber, index) => (
                      <TableRow key={subscriber.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {subscriber.email.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{subscriber.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 ml-2" />
                            {formatDate(subscriber.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {!subscriber.status || subscriber.status === 'active' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                              نشط
                            </Badge>
                          ) : subscriber.status === 'inactive' ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">
                              غير نشط
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">
                              مرتد
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                            {subscriber.source || 'الموقع'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">القائمة</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Mail className="ml-2 h-4 w-4" />
                                إرسال رسالة
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="ml-2 h-4 w-4" />
                                تعيين كنشط
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <XCircle className="ml-2 h-4 w-4" />
                                تعيين كغير نشط
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteSubscriber(subscriber)}
                              >
                                <Trash2 className="ml-2 h-4 w-4" />
                                حذف المشترك
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المشترك؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المشترك نهائيًا من قاعدة البيانات.
              {selectedSubscriber && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">البريد الإلكتروني: {selectedSubscriber.email}</p>
                  <p className="text-sm text-gray-500 mt-1">تاريخ الاشتراك: {formatDate(selectedSubscriber.createdAt)}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف المشترك
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminSubscribers;