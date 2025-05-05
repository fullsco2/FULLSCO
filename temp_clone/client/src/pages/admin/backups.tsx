import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Clock, 
  File, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Menu, 
  HardDrive,
  FileUp,
  FileDown,
  Calendar
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/admin/sidebar';

// واجهة النسخة الاحتياطية
interface Backup {
  id: number;
  filename: string;
  size: number;
  timestamp: string;
  description?: string;
  type: 'full' | 'partial'; // نوع النسخة: كامل أو جزئي
  tables?: string[]; // الجداول التي تم نسخها (في حالة النسخ الجزئي)
  status: 'completed' | 'failed' | 'in_progress';
}

// واجهة إعدادات النسخ الاحتياطي
interface BackupSettings {
  enabled: boolean;
  schedule: 'daily' | 'weekly' | 'monthly';
  time: string;
  retention: number;
  includedTables: string[];
  excludedTables: string[];
  destination: 'local' | 'remote';
  remoteSettings?: {
    provider: string;
    credentials: Record<string, string>;
  };
}

// قائمة الجداول في قاعدة البيانات
const databaseTables = [
  'users',
  'categories',
  'levels',
  'countries',
  'scholarships',
  'posts',
  'tags',
  'post_tags',
  'success_stories',
  'subscribers',
  'seo_settings',
  'media',
  'roles',
  'permissions',
  'role_permissions',
  'notifications',
];

export default function BackupsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('backups');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [backupDescription, setBackupDescription] = useState('');
  const [backupType, setBackupType] = useState<'full' | 'partial'>('full');
  const [progress, setProgress] = useState(0);
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [isRestoreInProgress, setIsRestoreInProgress] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // استرجاع قائمة النسخ الاحتياطية
  const { data: backups, isLoading: backupsLoading, isError: backupsError, refetch: refetchBackups } = useQuery<Backup[]>({
    queryKey: ['/api/backups'],
    queryFn: async () => {
      try {
        // سيتم إضافة نقطة نهاية API لاحقًا - في الوقت الحالي استخدم بيانات تجريبية للتطوير
        // const response = await fetch('/api/backups');
        // if (!response.ok) throw new Error('فشل في استرجاع النسخ الاحتياطية');
        // return response.json();
        
        // بيانات تجريبية للعرض أثناء التطوير
        return [
          {
            id: 1,
            filename: 'backup_20250412_full.sql',
            size: 12245000,
            timestamp: '2025-04-12T08:30:00Z',
            description: 'نسخة احتياطية تلقائية يومية',
            type: 'full',
            status: 'completed'
          },
          {
            id: 2,
            filename: 'backup_20250411_full.sql',
            size: 12100000,
            timestamp: '2025-04-11T08:30:00Z',
            description: 'نسخة احتياطية تلقائية يومية',
            type: 'full',
            status: 'completed'
          },
          {
            id: 3,
            filename: 'backup_20250410_partial.sql',
            size: 5340000,
            timestamp: '2025-04-10T14:25:00Z',
            description: 'نسخة يدوية قبل تحديث النظام',
            type: 'partial',
            tables: ['users', 'scholarships', 'posts'],
            status: 'completed'
          },
          {
            id: 4,
            filename: 'backup_20250409_full.sql',
            size: 11800000,
            timestamp: '2025-04-09T08:30:00Z',
            description: 'نسخة احتياطية تلقائية يومية',
            type: 'full',
            status: 'completed'
          },
          {
            id: 5,
            filename: 'backup_20250408_full.sql',
            size: 11750000,
            timestamp: '2025-04-08T08:30:00Z',
            description: 'نسخة احتياطية تلقائية يومية',
            type: 'failed',
            status: 'failed'
          },
        ] as Backup[];
      } catch (error) {
        console.error('Error fetching backups:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  // استرجاع إعدادات النسخ الاحتياطي
  const { data: backupSettings, isLoading: settingsLoading, isError: settingsError, refetch: refetchSettings } = useQuery<BackupSettings>({
    queryKey: ['/api/backups/settings'],
    queryFn: async () => {
      try {
        // سيتم إضافة نقطة نهاية API لاحقًا - في الوقت الحالي استخدم بيانات تجريبية للتطوير
        // const response = await fetch('/api/backups/settings');
        // if (!response.ok) throw new Error('فشل في استرجاع إعدادات النسخ الاحتياطي');
        // return response.json();
        
        // بيانات تجريبية للعرض أثناء التطوير
        return {
          enabled: true,
          schedule: 'daily',
          time: '08:30',
          retention: 7,
          includedTables: [],
          excludedTables: [],
          destination: 'local',
        } as BackupSettings;
      } catch (error) {
        console.error('Error fetching backup settings:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  // إنشاء نسخة احتياطية جديدة
  const createBackupMutation = useMutation({
    mutationFn: async ({ type, description, tables }: { type: 'full' | 'partial', description?: string, tables?: string[] }) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch('/api/backups', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ type, description, tables }),
      // });
      // if (!response.ok) throw new Error('فشل في إنشاء نسخة احتياطية');
      // return response.json();
      
      // محاكاة استجابة API مع تقدم العملية
      setIsBackupInProgress(true);
      
      // محاكاة تقدم العملية
      let progress = 0;
      const intervalId = setInterval(() => {
        progress += 10;
        setProgress(progress);
        
        if (progress >= 100) {
          clearInterval(intervalId);
          setIsBackupInProgress(false);
        }
      }, 500);
      
      // محاكاة استجابة API بعد انتهاء العملية
      return new Promise<Backup>((resolve) => {
        setTimeout(() => {
          const now = new Date();
          const dateString = now.toISOString().split('T')[0].replace(/-/g, '');
          
          resolve({
            id: Math.max(0, ...backups?.map(b => b.id) || []) + 1,
            filename: `backup_${dateString}_${type}.sql`,
            size: type === 'full' ? 12300000 : 5400000,
            timestamp: now.toISOString(),
            description: description || (type === 'full' ? 'نسخة احتياطية كاملة' : 'نسخة احتياطية جزئية'),
            type,
            tables: tables,
            status: 'completed'
          });
        }, 5000);
      });
    },
    onSuccess: (newBackup) => {
      queryClient.setQueryData(['/api/backups'], (old: Backup[] | undefined) => 
        [newBackup, ...(old || [])]
      );
      toast({ title: 'تم إنشاء النسخة الاحتياطية بنجاح', description: 'تم إنشاء وتخزين النسخة الاحتياطية' });
      setIsCreateDialogOpen(false);
      setBackupDescription('');
      setSelectedTables([]);
      setBackupType('full');
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في إنشاء النسخة الاحتياطية: ${error.message}`, variant: 'destructive' });
      setIsBackupInProgress(false);
    },
  });

  // استعادة نسخة احتياطية
  const restoreBackupMutation = useMutation({
    mutationFn: async ({ id, file }: { id?: number, file?: File }) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // if (id) {
      //   const response = await fetch(`/api/backups/${id}/restore`, {
      //     method: 'POST',
      //   });
      //   if (!response.ok) throw new Error('فشل في استعادة النسخة الاحتياطية');
      //   return response.json();
      // } else if (file) {
      //   const formData = new FormData();
      //   formData.append('file', file);
      //   
      //   const response = await fetch('/api/backups/restore-upload', {
      //     method: 'POST',
      //     body: formData,
      //   });
      //   if (!response.ok) throw new Error('فشل في استعادة النسخة الاحتياطية المرفوعة');
      //   return response.json();
      // }
      
      // محاكاة استجابة API مع تقدم العملية
      setIsRestoreInProgress(true);
      
      // محاكاة تقدم العملية
      let progress = 0;
      const intervalId = setInterval(() => {
        progress += 5;
        setProgress(progress);
        
        if (progress >= 100) {
          clearInterval(intervalId);
          setIsRestoreInProgress(false);
        }
      }, 400);
      
      // محاكاة استجابة API بعد انتهاء العملية
      return new Promise<{ success: boolean }>((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 8000);
      });
    },
    onSuccess: () => {
      toast({ title: 'تمت الاستعادة بنجاح', description: 'تمت استعادة قاعدة البيانات من النسخة الاحتياطية' });
      setIsRestoreDialogOpen(false);
      setSelectedBackup(null);
      setBackupFile(null);
      refetchBackups();
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في استعادة النسخة الاحتياطية: ${error.message}`, variant: 'destructive' });
      setIsRestoreInProgress(false);
    },
  });

  // حذف نسخة احتياطية
  const deleteBackupMutation = useMutation({
    mutationFn: async (id: number) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/backups/${id}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('فشل في حذف النسخة الاحتياطية');
      // return response.json();
      
      // محاكاة استجابة API
      return new Promise<{ success: boolean, id: number }>((resolve) => {
        setTimeout(() => {
          resolve({ success: true, id });
        }, 1000);
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/backups'], (old: Backup[] | undefined) => 
        (old || []).filter(backup => backup.id !== data.id)
      );
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف النسخة الاحتياطية' });
      setIsDeleteDialogOpen(false);
      setSelectedBackup(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في حذف النسخة الاحتياطية: ${error.message}`, variant: 'destructive' });
    },
  });

  // تحديث إعدادات النسخ الاحتياطي
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<BackupSettings>) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch('/api/backups/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // });
      // if (!response.ok) throw new Error('فشل في تحديث إعدادات النسخ الاحتياطي');
      // return response.json();
      
      // محاكاة استجابة API
      return new Promise<BackupSettings>((resolve) => {
        setTimeout(() => {
          resolve({
            ...backupSettings!,
            ...settings,
          });
        }, 1000);
      });
    },
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['/api/backups/settings'], updatedSettings);
      toast({ title: 'تم التحديث بنجاح', description: 'تم تحديث إعدادات النسخ الاحتياطي' });
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تحديث إعدادات النسخ الاحتياطي: ${error.message}`, variant: 'destructive' });
    },
  });

  // تنسيق حجم الملف
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // تنسيق التاريخ والوقت
  const formatDateTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-SA') + ' ' + date.toLocaleTimeString('ar-SA');
  };

  // التعامل مع تغيير ملف النسخ الاحتياطي
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setBackupFile(files[0]);
    }
  };

  // في حالة تحميل بيانات المصادقة أو عدم تسجيل الدخول
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen relative overflow-x-hidden">
      {/* السايدبار للجوال */}
      <Sidebar 
        isMobileOpen={sidebarOpen} 
        onClose={() => {
          console.log('Backups: closing sidebar');
          setSidebarOpen(false);
        }} 
      />
      
      {/* المحتوى الرئيسي */}
      <div className={cn(
        "transition-all duration-300",
        isMobile ? "w-full" : "mr-64"
      )}>
        <main className="p-4 md:p-6">
          {/* زر فتح السايدبار في الجوال والهيدر */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2" 
                  onClick={() => setSidebarOpen(true)}
                  aria-label="فتح القائمة"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-xl md:text-2xl font-bold">النسخ الاحتياطي واستعادة البيانات</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => activeTab === 'backups' ? refetchBackups() : refetchSettings()}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
              
              {activeTab === 'backups' && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Database className="ml-2 h-4 w-4" />
                      نسخ احتياطي جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>إنشاء نسخة احتياطية جديدة</DialogTitle>
                      <DialogDescription>
                        قم بإنشاء نسخة احتياطية جديدة لقاعدة البيانات.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="backup-type">نوع النسخة الاحتياطية</Label>
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <Label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                            <input
                              type="radio"
                              name="backup-type"
                              className="h-4 w-4 text-primary"
                              checked={backupType === 'full'}
                              onChange={() => setBackupType('full')}
                            />
                            <span>نسخة كاملة</span>
                          </Label>
                          <Label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                            <input
                              type="radio"
                              name="backup-type"
                              className="h-4 w-4 text-primary"
                              checked={backupType === 'partial'}
                              onChange={() => setBackupType('partial')}
                            />
                            <span>نسخة جزئية</span>
                          </Label>
                        </div>
                      </div>
                      
                      {backupType === 'partial' && (
                        <div className="space-y-2">
                          <Label>اختر الجداول المراد نسخها</Label>
                          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                            {databaseTables.map(table => (
                              <Label key={table} className="flex items-center p-2 space-x-2 space-x-reverse bg-muted/30 rounded-md cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={selectedTables.includes(table)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedTables(prev => [...prev, table]);
                                    } else {
                                      setSelectedTables(prev => prev.filter(t => t !== table));
                                    }
                                  }}
                                />
                                <span>{table}</span>
                              </Label>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="backup-description">وصف النسخة الاحتياطية (اختياري)</Label>
                        <Input
                          id="backup-description"
                          placeholder="وصف يساعد في تحديد الغرض من هذه النسخة"
                          value={backupDescription}
                          onChange={(e) => setBackupDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      {isBackupInProgress ? (
                        <div className="w-full space-y-2">
                          <Progress value={progress} className="w-full" />
                          <p className="text-sm text-center text-muted-foreground">
                            جاري إنشاء النسخة الاحتياطية... ({progress}%)
                          </p>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => createBackupMutation.mutate({
                            type: backupType,
                            description: backupDescription,
                            tables: backupType === 'partial' ? selectedTables : undefined
                          })}
                          disabled={backupType === 'partial' && selectedTables.length === 0}
                        >
                          <Database className="ml-2 h-4 w-4" />
                          بدء النسخ الاحتياطي
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="backups">
                <HardDrive className="ml-2 h-4 w-4" />
                النسخ الاحتياطية
              </TabsTrigger>
              <TabsTrigger value="restore">
                <FileDown className="ml-2 h-4 w-4" />
                استعادة البيانات
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Calendar className="ml-2 h-4 w-4" />
                الجدولة والإعدادات
              </TabsTrigger>
            </TabsList>
            
            {/* تبويب النسخ الاحتياطية */}
            <TabsContent value="backups">
              <Card>
                <CardHeader>
                  <CardTitle>قائمة النسخ الاحتياطية</CardTitle>
                  <CardDescription>
                    قائمة بجميع النسخ الاحتياطية المخزنة في النظام.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {backupsLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="mr-2">جاري التحميل...</span>
                    </div>
                  ) : backupsError ? (
                    <div className="text-center py-4 text-red-500">
                      <p>حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
                      <Button variant="outline" onClick={() => refetchBackups()} className="mt-2">
                        إعادة المحاولة
                      </Button>
                    </div>
                  ) : backups && backups.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12 text-right">الرقم</TableHead>
                            <TableHead className="text-right">اسم الملف</TableHead>
                            <TableHead className="text-right">النوع</TableHead>
                            <TableHead className="text-right">الحجم</TableHead>
                            <TableHead className="text-right">التاريخ</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">الوصف</TableHead>
                            <TableHead className="text-left w-[150px]">الإجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {backups.map((backup) => (
                            <TableRow key={backup.id}>
                              <TableCell>{backup.id}</TableCell>
                              <TableCell className="font-medium">{backup.filename}</TableCell>
                              <TableCell>
                                {backup.type === 'full' ? 'كامل' : 'جزئي'}
                                {backup.type === 'partial' && backup.tables && (
                                  <span className="text-xs text-muted-foreground block">
                                    ({backup.tables.length} جداول)
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>{formatFileSize(backup.size)}</TableCell>
                              <TableCell>{formatDateTime(backup.timestamp)}</TableCell>
                              <TableCell>
                                {backup.status === 'completed' ? (
                                  <span className="inline-flex items-center text-green-600">
                                    <CheckCircle className="h-4 w-4 ml-1" />
                                    مكتمل
                                  </span>
                                ) : backup.status === 'failed' ? (
                                  <span className="inline-flex items-center text-red-600">
                                    <AlertTriangle className="h-4 w-4 ml-1" />
                                    فشل
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-amber-600">
                                    <RefreshCw className="h-4 w-4 ml-1 animate-spin" />
                                    جاري...
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>{backup.description || '-'}</TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      // تنزيل النسخة الاحتياطية - عادة سيكون هناك API لهذا
                                      toast({ title: 'جاري التنزيل', description: 'بدأ تنزيل النسخة الاحتياطية' });
                                    }}
                                    title="تنزيل"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setSelectedBackup(backup);
                                      setIsRestoreDialogOpen(true);
                                    }}
                                    title="استعادة"
                                    disabled={backup.status !== 'completed'}
                                  >
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500"
                                    onClick={() => {
                                      setSelectedBackup(backup);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    title="حذف"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <div className="mx-auto p-6 bg-muted rounded-full w-20 h-20 flex items-center justify-center mb-4">
                        <Database className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <p>لا توجد نسخ احتياطية حاليًا.</p>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)} className="mt-2">
                        إنشاء نسخة احتياطية
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* تبويب استعادة البيانات */}
            <TabsContent value="restore">
              <Card>
                <CardHeader>
                  <CardTitle>استعادة البيانات</CardTitle>
                  <CardDescription>
                    استعادة قاعدة البيانات من ملف نسخة احتياطية.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold">تحذير: عملية حساسة</h4>
                          <p className="text-sm mt-1">
                            استعادة البيانات هي عملية حساسة ستؤدي إلى استبدال البيانات الحالية تمامًا.
                            تأكد من وجود نسخة احتياطية حديثة قبل المتابعة.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">استعادة من ملف مخزن</h3>
                        <div className="border rounded-md p-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            اختر نسخة احتياطية موجودة في النظام لاستعادتها.
                          </p>
                          {backupsLoading ? (
                            <div className="flex justify-center items-center h-24">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span className="mr-2 text-sm">جاري التحميل...</span>
                            </div>
                          ) : backups && backups.filter(b => b.status === 'completed').length > 0 ? (
                            <div className="space-y-3">
                              <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                                {backups
                                  .filter(b => b.status === 'completed')
                                  .map(backup => (
                                    <div 
                                      key={backup.id} 
                                      className={cn(
                                        "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                                        selectedBackup?.id === backup.id 
                                          ? "bg-primary/10 border border-primary/30" 
                                          : "hover:bg-muted/50 border border-transparent"
                                      )}
                                      onClick={() => setSelectedBackup(backup)}
                                    >
                                      <div className="flex items-center">
                                        <File className="h-4 w-4 ml-2 flex-shrink-0" />
                                        <div>
                                          <div className="font-medium text-sm">{backup.filename}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {formatDateTime(backup.timestamp)} • {formatFileSize(backup.size)}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-xs">
                                        {backup.type === 'full' ? 'كامل' : 'جزئي'}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                              
                              <Button 
                                className="w-full"
                                disabled={!selectedBackup || isRestoreInProgress}
                                onClick={() => setIsRestoreDialogOpen(true)}
                              >
                                <Upload className="ml-2 h-4 w-4" />
                                استعادة النسخة المحددة
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              <p className="text-sm">لا توجد نسخ احتياطية متاحة للاستعادة.</p>
                              <Button variant="outline" size="sm" onClick={() => setActiveTab('backups')} className="mt-2">
                                إنشاء نسخة احتياطية
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">استعادة من ملف خارجي</h3>
                        <div className="border rounded-md p-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            قم بتحميل ملف نسخة احتياطية SQL (.sql) لاستعادته.
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-center justify-center border-2 border-dashed rounded-md h-32">
                              <label className="flex flex-col items-center cursor-pointer">
                                <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm font-medium">
                                  {backupFile 
                                    ? backupFile.name 
                                    : 'اختر ملفًا أو اسحبه هنا'
                                  }
                                </span>
                                <span className="text-xs text-muted-foreground mt-1">
                                  {backupFile 
                                    ? formatFileSize(backupFile.size) 
                                    : 'ملفات .sql فقط، الحد الأقصى 100 ميجابايت'
                                  }
                                </span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept=".sql" 
                                  onChange={handleFileChange}
                                />
                              </label>
                            </div>
                            
                            <Button 
                              className="w-full" 
                              disabled={!backupFile || isRestoreInProgress}
                              onClick={() => setIsRestoreDialogOpen(true)}
                            >
                              <Upload className="ml-2 h-4 w-4" />
                              تحميل واستعادة الملف
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* تبويب الإعدادات */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات النسخ الاحتياطي</CardTitle>
                  <CardDescription>
                    قم بتكوين جدولة النسخ الاحتياطي التلقائي وإعدادات الاحتفاظ بالملفات.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {settingsLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="mr-2">جاري التحميل...</span>
                    </div>
                  ) : settingsError ? (
                    <div className="text-center py-4 text-red-500">
                      <p>حدث خطأ أثناء تحميل الإعدادات. يرجى المحاولة مرة أخرى.</p>
                      <Button variant="outline" onClick={() => refetchSettings()} className="mt-2">
                        إعادة المحاولة
                      </Button>
                    </div>
                  ) : backupSettings ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b">
                        <div className="space-y-1">
                          <h3 className="font-medium">النسخ الاحتياطي التلقائي</h3>
                          <p className="text-sm text-muted-foreground">
                            تمكين جدولة النسخ الاحتياطي التلقائي لقاعدة البيانات
                          </p>
                        </div>
                        <Switch 
                          checked={backupSettings.enabled} 
                          onCheckedChange={(checked) => updateSettingsMutation.mutate({ enabled: checked })}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">جدولة النسخ الاحتياطي</h3>
                        
                        <div className="flex flex-wrap gap-4">
                          <div className="space-y-2">
                            <Label>تكرار النسخ</Label>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={backupSettings.schedule}
                              onChange={(e) => updateSettingsMutation.mutate({ schedule: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                              disabled={!backupSettings.enabled}
                            >
                              <option value="daily">يومي</option>
                              <option value="weekly">أسبوعي</option>
                              <option value="monthly">شهري</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>وقت النسخ</Label>
                            <Input 
                              type="time" 
                              value={backupSettings.time} 
                              onChange={(e) => updateSettingsMutation.mutate({ time: e.target.value })}
                              disabled={!backupSettings.enabled}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>الاحتفاظ لمدة (أيام)</Label>
                            <Input 
                              type="number" 
                              min="1" 
                              max="365"
                              value={backupSettings.retention} 
                              onChange={(e) => updateSettingsMutation.mutate({ retention: parseInt(e.target.value) })}
                              disabled={!backupSettings.enabled}
                            />
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                          النسخ التالي المجدول: {backupSettings.enabled ? (
                            <span className="font-medium text-foreground">
                              {(() => {
                                const now = new Date();
                                const [hours, minutes] = backupSettings.time.split(':');
                                let nextBackup = new Date();
                                nextBackup.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                
                                if (backupSettings.schedule === 'daily') {
                                  if (nextBackup <= now) {
                                    nextBackup.setDate(nextBackup.getDate() + 1);
                                  }
                                } else if (backupSettings.schedule === 'weekly') {
                                  const dayDiff = 7 - ((now.getDay() - 1) % 7);
                                  nextBackup.setDate(nextBackup.getDate() + dayDiff);
                                } else if (backupSettings.schedule === 'monthly') {
                                  nextBackup.setDate(1);
                                  nextBackup.setMonth(nextBackup.getMonth() + 1);
                                }
                                
                                return nextBackup.toLocaleDateString('ar-SA') + ' ' + nextBackup.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
                              })()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">غير مجدول</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-medium">إعدادات متقدمة</h3>
                        
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            الجداول المستثناة
                            <span className="text-xs text-muted-foreground font-normal">(اختياري)</span>
                          </Label>
                          <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                            {databaseTables.map(table => (
                              <Label key={table} className="flex items-center p-2 space-x-2 space-x-reverse bg-muted/30 rounded-md cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={backupSettings.excludedTables.includes(table)}
                                  onChange={(e) => {
                                    const currentExcluded = [...backupSettings.excludedTables];
                                    if (e.target.checked) {
                                      if (!currentExcluded.includes(table)) {
                                        updateSettingsMutation.mutate({ 
                                          excludedTables: [...currentExcluded, table] 
                                        });
                                      }
                                    } else {
                                      updateSettingsMutation.mutate({ 
                                        excludedTables: currentExcluded.filter(t => t !== table) 
                                      });
                                    }
                                  }}
                                  disabled={!backupSettings.enabled}
                                />
                                <span>{table}</span>
                              </Label>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            الجداول المحددة لن يتم تضمينها في النسخ الاحتياطي التلقائي.
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="space-y-1">
                            <h4 className="font-medium">وجهة النسخ الاحتياطي</h4>
                            <p className="text-sm text-muted-foreground">
                              تخزين النسخ الاحتياطية على الخادم المحلي أو خادم بعيد
                            </p>
                          </div>
                          <select
                            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={backupSettings.destination}
                            onChange={(e) => updateSettingsMutation.mutate({ destination: e.target.value as 'local' | 'remote' })}
                            disabled={!backupSettings.enabled}
                          >
                            <option value="local">الخادم المحلي</option>
                            <option value="remote">خادم بعيد</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => refetchSettings()}>
                    إعادة ضبط
                  </Button>
                  <Button onClick={() => toast({ title: 'تم الحفظ بنجاح', description: 'تم تطبيق الإعدادات بنجاح' })}>
                    حفظ الإعدادات
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          {/* نافذة تأكيد الاستعادة */}
          <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد استعادة البيانات</AlertDialogTitle>
                <AlertDialogDescription>
                  هذه العملية ستستبدل جميع البيانات الحالية في قاعدة البيانات بالبيانات من النسخة الاحتياطية.
                  هذا الإجراء لا يمكن التراجع عنه.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              {isRestoreInProgress ? (
                <div className="space-y-4 py-4">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    جاري استعادة البيانات... ({progress}%)
                  </p>
                </div>
              ) : (
                <div className="py-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                    <AlertTriangle className="h-4 w-4 inline-block ml-1" />
                    يُنصح بشدة بإنشاء نسخة احتياطية جديدة قبل الاستمرار. هل أنت متأكد من رغبتك في المتابعة؟
                  </div>
                </div>
              )}
              
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isRestoreInProgress}>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => {
                    if (selectedBackup) {
                      restoreBackupMutation.mutate({ id: selectedBackup.id });
                    } else if (backupFile) {
                      restoreBackupMutation.mutate({ file: backupFile });
                    }
                  }}
                  disabled={isRestoreInProgress || (!selectedBackup && !backupFile)}
                >
                  نعم، استعادة البيانات
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* نافذة تأكيد الحذف */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف النسخة الاحتياطية "{selectedBackup?.filename}" بشكل نهائي.
                  هذا الإجراء لا يمكن التراجع عنه.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => selectedBackup && deleteBackupMutation.mutate(selectedBackup.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {deleteBackupMutation.isPending ? (
                    <>
                      <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                      جارٍ الحذف...
                    </>
                  ) : (
                    'حذف'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}