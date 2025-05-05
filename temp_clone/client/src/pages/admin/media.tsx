import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, RefreshCw, X, Image as ImageIcon, File, Trash2, Download, Copy, CheckCircle, Filter, Grid, List, Search, UploadCloud } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/admin-layout';

// زودج سكيما للتحقق من صحة البيانات
const mediaFileSchema = z.object({
  title: z.string().optional(),
  alt: z.string().optional(),
  file: z.custom<File>((val) => val === undefined || val === null || (typeof val === 'object' && 'name' in val && 'size' in val && 'type' in val)).optional(),
  url: z.string().url('يجب أن يكون رابط صالح').optional(),
});

type MediaFileFormValues = z.infer<typeof mediaFileSchema>;

// واجهة ملف الوسائط
interface MediaFile {
  id: number;
  filename: string;
  originalFilename: string;
  url: string;
  mimeType: string;
  size: number;
  title?: string;
  alt?: string;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}

export default function MediaManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // استلام ملفات الوسائط من الخادم
  const { data: mediaFiles, isLoading, isError, refetch } = useQuery<MediaFile[]>({
    queryKey: ['/api/media'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/media');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'فشل في استلام ملفات الوسائط');
        }
        const result = await response.json();
        // استخراج البيانات من كائن الاستجابة الذي يتبع نمط { success: true, data: [...] }
        return result.data || [];
      } catch (error) {
        console.error('Error fetching media files:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  // رفع ملف وسائط جديد
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/media', {
        method: 'POST',
        body: data,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في رفع الملف');
      }
      const result = await response.json();
      return result.data || result; // استخراج البيانات من استجابة API
    },
    onSuccess: (newFile) => {
      queryClient.setQueryData(['/api/media'], (old: MediaFile[] | undefined) => 
        [...(old || []), newFile]
      );
      toast({ title: 'تم الرفع بنجاح', description: 'تم رفع الملف بنجاح' });
      setIsUploadDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في رفع الملف: ${error.message}`, variant: 'destructive' });
    },
  });

  // تحديث معلومات ملف وسائط
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: { title?: string, alt?: string } }) => {
      const response = await fetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في تحديث معلومات الملف');
      }
      
      const result = await response.json();
      return result.data || result; // استخراج البيانات من استجابة API
    },
    onSuccess: (updatedFile) => {
      queryClient.setQueryData(['/api/media'], (old: MediaFile[] | undefined) => 
        (old || []).map(file => file.id === updatedFile.id ? updatedFile : file)
      );
      toast({ title: 'تم التحديث بنجاح', description: 'تم تحديث معلومات الملف بنجاح' });
      setIsDetailsDialogOpen(false);
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تحديث معلومات الملف: ${error.message}`, variant: 'destructive' });
    },
  });

  // حذف ملف وسائط
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في حذف الملف');
      }
      
      return { success: true, id };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/media'], (old: MediaFile[] | undefined) => 
        (old || []).filter(file => file.id !== data.id)
      );
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف الملف بنجاح' });
      setIsDeleteDialogOpen(false);
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في حذف الملف: ${error.message}`, variant: 'destructive' });
    },
  });

  // حذف مجموعة من ملفات الوسائط
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await fetch(`/api/media/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في حذف الملفات');
      }
      
      return { success: true, ids };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/media'], (old: MediaFile[] | undefined) => 
        (old || []).filter(file => !data.ids.includes(file.id))
      );
      toast({ title: 'تم الحذف بنجاح', description: `تم حذف ${data.ids.length} ملفات بنجاح` });
      setSelectedFiles([]);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في حذف الملفات: ${error.message}`, variant: 'destructive' });
    },
  });

  // نموذج رفع ملف جديد
  const uploadForm = useForm<MediaFileFormValues>({
    resolver: zodResolver(mediaFileSchema),
    defaultValues: {
      title: '',
      alt: '',
      file: undefined,
    },
  });

  // نموذج تعديل معلومات الملف
  const detailsForm = useForm<{ title: string, alt: string }>({
    defaultValues: {
      title: selectedFile?.title || '',
      alt: selectedFile?.alt || '',
    },
  });

  // تحديث نموذج تفاصيل الملف عند تغيير الملف المحدد
  useEffect(() => {
    if (selectedFile) {
      detailsForm.reset({
        title: selectedFile.title || '',
        alt: selectedFile.alt || '',
      });
    }
  }, [selectedFile, detailsForm]);

  // فلترة الملفات حسب معايير البحث
  const filteredFiles = mediaFiles?.filter(file => {
    // فلترة حسب البحث
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        file.filename.toLowerCase().includes(search) ||
        file.originalFilename.toLowerCase().includes(search) ||
        (file.title && file.title.toLowerCase().includes(search)) ||
        (file.alt && file.alt.toLowerCase().includes(search))
      );
    }
    
    // فلترة حسب نوع الملف
    if (fileType !== 'all') {
      if (fileType === 'image' && !file.mimeType.startsWith('image/')) return false;
      if (fileType === 'document' && !(
        file.mimeType.includes('pdf') ||
        file.mimeType.includes('word') ||
        file.mimeType.includes('excel') ||
        file.mimeType.includes('spreadsheet') ||
        file.mimeType.includes('text')
      )) return false;
      if (fileType === 'other' && (
        file.mimeType.startsWith('image/') ||
        file.mimeType.includes('pdf') ||
        file.mimeType.includes('word') ||
        file.mimeType.includes('excel') ||
        file.mimeType.includes('spreadsheet') ||
        file.mimeType.includes('text')
      )) return false;
    }
    
    return true;
  }) || [];

  // ترتيب الملفات
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'name_asc') return a.filename.localeCompare(b.filename);
    if (sortBy === 'name_desc') return b.filename.localeCompare(a.filename);
    if (sortBy === 'size_asc') return a.size - b.size;
    if (sortBy === 'size_desc') return b.size - a.size;
    return 0;
  });

  // التحقق من اختيار ملف
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadForm.setValue('file', files[0]);
      console.log('تم اختيار الملف:', files[0].name);
    }
  };

  // تنفيذ رفع الملف
  const handleUploadFile = (data: MediaFileFormValues) => {
    if (!data.file) {
      toast({ title: 'خطأ!', description: 'يرجى اختيار ملف للرفع', variant: 'destructive' });
      return;
    }
    
    console.log('المعلومات المرسلة للرفع:', {
      ملف: data.file.name,
      عنوان: data.title,
      وصف: data.alt
    });
    
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.title) formData.append('title', data.title);
    if (data.alt) formData.append('alt', data.alt);
    
    uploadMutation.mutate(formData);
  };

  // تنفيذ تحديث معلومات الملف
  const handleUpdateFile = (data: { title: string, alt: string }) => {
    if (selectedFile) {
      updateMutation.mutate({
        id: selectedFile.id,
        data: {
          title: data.title || undefined,
          alt: data.alt || undefined,
        },
      });
    }
  };

  // التبديل بين تحديد ملف
  const toggleFileSelection = (id: number) => {
    setSelectedFiles(prev => 
      prev.includes(id)
        ? prev.filter(fileId => fileId !== id)
        : [...prev, id]
    );
  };

  // التحقق مما إذا كان الملف محدد
  const isFileSelected = (id: number) => {
    return selectedFiles.includes(id);
  };

  // تحديد جميع الملفات
  const selectAllFiles = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id));
    }
  };

  // نسخ رابط الملف إلى الحافظة
  const copyFileUrl = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        toast({ title: 'تم النسخ', description: 'تم نسخ رابط الملف إلى الحافظة' });
      })
      .catch(error => {
        toast({ title: 'خطأ!', description: 'فشل في نسخ الرابط', variant: 'destructive' });
        console.error('Failed to copy URL:', error);
      });
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // الحصول على أيقونة الملف حسب نوعه
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  // الحصول على اسم مختصر للملف
  const getShortFileName = (filename: string, maxLength = 20) => {
    if (filename.length <= maxLength) return filename;
    
    const extension = filename.split('.').pop() || '';
    const nameWithoutExtension = filename.slice(0, filename.lastIndexOf('.'));
    
    if (nameWithoutExtension.length <= maxLength - extension.length - 1) {
      return filename;
    }
    
    return nameWithoutExtension.slice(0, maxLength - extension.length - 4) + '...' + extension;
  };

  // إعادة ضبط نموذج الرفع عند فتح نافذة الرفع
  useEffect(() => {
    if (isUploadDialogOpen) {
      uploadForm.reset({
        title: '',
        alt: '',
        file: undefined,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isUploadDialogOpen, uploadForm]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        جاري التحميل...
      </div>
    );
  }

  // إعداد زر رفع الملفات وزر التحديث في شريط الإجراءات
  const mediaActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => refetch()}>
        <RefreshCw className="ml-2 h-4 w-4" />
        تحديث
      </Button>
      
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <UploadCloud className="ml-2 h-4 w-4" />
            رفع ملف
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );

  return (
    <AdminLayout title="إدارة ملفات الوسائط" actions={mediaActions}>
      <div className="p-4">
        {/* شريط أدوات البحث والفلترة */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between bg-muted/30 p-4 rounded-lg">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="بحث عن ملفات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96"
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="p-2">
                  <p className="mb-2 text-sm font-medium">نوع الملف</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="filter-all" 
                        checked={fileType === 'all'} 
                        onCheckedChange={() => setFileType('all')}
                      />
                      <label htmlFor="filter-all" className="text-sm">الكل</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="filter-images" 
                        checked={fileType === 'image'} 
                        onCheckedChange={() => setFileType('image')}
                      />
                      <label htmlFor="filter-images" className="text-sm">صور</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="filter-documents" 
                        checked={fileType === 'document'} 
                        onCheckedChange={() => setFileType('document')}
                      />
                      <label htmlFor="filter-documents" className="text-sm">مستندات</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="filter-other" 
                        checked={fileType === 'other'} 
                        onCheckedChange={() => setFileType('other')}
                      />
                      <label htmlFor="filter-other" className="text-sm">أخرى</label>
                    </div>
                  </div>
                  
                  <hr className="my-2" />
                  
                  <p className="mb-2 text-sm font-medium">الترتيب</p>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="ترتيب حسب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">الأحدث</SelectItem>
                      <SelectItem value="oldest">الأقدم</SelectItem>
                      <SelectItem value="name_asc">الاسم (أ-ي)</SelectItem>
                      <SelectItem value="name_desc">الاسم (ي-أ)</SelectItem>
                      <SelectItem value="size_asc">الحجم (الأصغر أولاً)</SelectItem>
                      <SelectItem value="size_desc">الحجم (الأكبر أولاً)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className={cn(viewMode === 'grid' && "bg-muted")}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(viewMode === 'list' && "bg-muted")}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedFiles.length} ملف محدد
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف المحدد
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>هل أنت متأكد من حذف الملفات المحددة؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        سيتم حذف {selectedFiles.length} ملف بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => bulkDeleteMutation.mutate(selectedFiles)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {bulkDeleteMutation.isPending ? 'جاري الحذف...' : 'تأكيد الحذف'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
        
        {/* عرض الملفات */}
        <div className="mb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p>جاري تحميل الملفات...</p>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-destructive">حدث خطأ أثناء تحميل الملفات</p>
            </div>
          ) : sortedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg">
              <div className="mb-4 text-muted-foreground">
                <File className="h-12 w-12 mx-auto mb-2" />
                <p>لا توجد ملفات متاحة</p>
              </div>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UploadCloud className="ml-2 h-4 w-4" />
                    رفع ملف جديد
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedFiles.map((file) => (
                <Card key={file.id} className={cn("overflow-hidden group", isFileSelected(file.id) && "ring-2 ring-primary")}>
                  <div className="relative">
                    {file.mimeType.startsWith('image/') ? (
                      <div 
                        className="aspect-video bg-muted flex items-center justify-center overflow-hidden cursor-pointer" 
                        onClick={() => {
                          setSelectedFile(file);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        <img
                          src={file.url}
                          alt={file.alt || file.originalFilename}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div 
                        className="aspect-video bg-muted flex items-center justify-center" 
                        onClick={() => {
                          setSelectedFile(file);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        <div className="text-center cursor-pointer">
                          {getFileIcon(file.mimeType)}
                          <p className="text-xs mt-2 text-muted-foreground">
                            {file.originalFilename.split('.').pop()?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2">
                      <Checkbox 
                        checked={isFileSelected(file.id)}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                        className="h-5 w-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-white hover:bg-black/20"
                        onClick={() => {
                          setSelectedFile(file);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-white hover:bg-black/20"
                        onClick={() => copyFileUrl(file.url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <a 
                        href={file.url} 
                        download={file.originalFilename}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-white hover:bg-black/20"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-white hover:bg-red-500/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد من حذف الملف؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم حذف الملف "{file.originalFilename}" بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteMutation.mutate(file.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleteMutation.isPending && selectedFile?.id === file.id ? 'جاري الحذف...' : 'تأكيد الحذف'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate" title={file.title || file.originalFilename}>
                      {file.title || getShortFileName(file.originalFilename)}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm bg-muted/30">
                <div className="col-span-1">
                  <Checkbox 
                    checked={selectedFiles.length > 0 && selectedFiles.length === filteredFiles.length} 
                    onCheckedChange={selectAllFiles}
                  />
                </div>
                <div className="col-span-5">الملف</div>
                <div className="col-span-2">الحجم</div>
                <div className="col-span-2">النوع</div>
                <div className="col-span-2">إجراءات</div>
              </div>
              {sortedFiles.map((file) => (
                <div key={file.id} className={cn("grid grid-cols-12 gap-4 p-4 text-sm border-t", isFileSelected(file.id) && "bg-muted/30")}>
                  <div className="col-span-1">
                    <Checkbox 
                      checked={isFileSelected(file.id)}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                    />
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.alt || file.originalFilename}
                          className="object-cover h-full w-full rounded"
                        />
                      ) : (
                        getFileIcon(file.mimeType)
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium truncate" title={file.title || file.originalFilename}>
                        {file.title || file.originalFilename}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {new Date(file.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center text-muted-foreground">
                    {formatFileSize(file.size)}
                  </div>
                  <div className="col-span-2 flex items-center text-muted-foreground">
                    {file.mimeType.split('/')[1]?.toUpperCase() || file.mimeType}
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedFile(file);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => copyFileUrl(file.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <a 
                      href={file.url} 
                      download={file.originalFilename}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد من حذف الملف؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            سيتم حذف الملف "{file.originalFilename}" بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMutation.mutate(file.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteMutation.isPending && selectedFile?.id === file.id ? 'جاري الحذف...' : 'تأكيد الحذف'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* نافذة رفع ملف جديد */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>رفع ملف جديد</DialogTitle>
              <DialogDescription>
                اختر ملفًا من جهازك لرفعه إلى المكتبة
              </DialogDescription>
            </DialogHeader>
            <Form {...uploadForm}>
              <form onSubmit={uploadForm.handleSubmit(handleUploadFile)} className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <FormLabel htmlFor="file-upload">الملف</FormLabel>
                  <Input
                    id="file-upload"
                    type="file"
                    className="cursor-pointer"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  {uploadForm.getValues().file && (
                    <div className="mt-1 p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded text-xs flex items-center">
                      <CheckCircle className="h-4 w-4 ml-2" />
                      <div>
                        <p>تم اختيار الملف:</p>
                        <p className="font-bold mt-1">{uploadForm.getValues().file?.name}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <FormField
                  control={uploadForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان الملف</FormLabel>
                      <FormControl>
                        <Input placeholder="عنوان وصفي للملف" {...field} />
                      </FormControl>
                      <FormDescription>
                        سيظهر هذا العنوان بدلاً من اسم الملف الأصلي.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={uploadForm.control}
                  name="alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>النص البديل</FormLabel>
                      <FormControl>
                        <Input placeholder="وصف للصورة" {...field} />
                      </FormControl>
                      <FormDescription>
                        مهم لإمكانية الوصول وتحسين SEO (للصور فقط).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={uploadMutation.isPending || !uploadForm.getValues().file}
                  >
                    {uploadMutation.isPending ? 'جاري الرفع...' : 'رفع الملف'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* نافذة تفاصيل الملف */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>تفاصيل الملف</DialogTitle>
            </DialogHeader>
            {selectedFile && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {selectedFile.mimeType.startsWith('image/') ? (
                    <div className="mb-4 overflow-hidden rounded-lg border bg-muted max-w-full">
                      <img 
                        src={selectedFile.url} 
                        alt={selectedFile.alt || selectedFile.originalFilename}
                        className="max-h-[300px] object-contain mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 h-40 w-40 flex items-center justify-center bg-muted rounded-lg">
                      {getFileIcon(selectedFile.mimeType)}
                    </div>
                  )}
                </div>
                
                <Form {...detailsForm}>
                  <form onSubmit={detailsForm.handleSubmit(handleUpdateFile)} className="space-y-4">
                    <FormField
                      control={detailsForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عنوان الملف</FormLabel>
                          <FormControl>
                            <Input placeholder="عنوان وصفي للملف" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={detailsForm.control}
                      name="alt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>النص البديل</FormLabel>
                          <FormControl>
                            <Input placeholder="وصف للصورة" {...field} />
                          </FormControl>
                          <FormDescription>
                            مهم لإمكانية الوصول وتحسين SEO (للصور فقط).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">الاسم الأصلي:</span>
                        <span>{selectedFile.originalFilename}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">الحجم:</span>
                        <span>{formatFileSize(selectedFile.size)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">نوع الملف:</span>
                        <span>{selectedFile.mimeType}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">تاريخ الرفع:</span>
                        <span>{new Date(selectedFile.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">الرابط:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={selectedFile.url}
                            className="w-full text-xs p-1 border rounded bg-muted"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyFileUrl(selectedFile.url)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter className="gap-2 sm:gap-0">
                      <div className="flex items-center gap-2">
                        <a 
                          href={selectedFile.url} 
                          download={selectedFile.originalFilename}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" type="button">
                            <Download className="ml-2 h-4 w-4" />
                            تنزيل
                          </Button>
                        </a>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" type="button">
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد من حذف الملف؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                سيتم حذف الملف "{selectedFile.originalFilename}" بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteMutation.mutate(selectedFile.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleteMutation.isPending ? 'جاري الحذف...' : 'تأكيد الحذف'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}