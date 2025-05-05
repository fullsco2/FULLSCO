import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, X, Search, Grid, Filter, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface MediaSelectorProps {
  onSelect?: (mediaFile: MediaFile) => void;
  onChange?: (url: string) => void;
  value?: string;
  selectedUrl?: string;
  triggerButtonLabel?: string;
  triggerButtonIcon?: React.ReactNode;
  showPreview?: boolean;
  previewSize?: 'small' | 'medium' | 'large';
  allowClear?: boolean;
  onClear?: () => void;
  onlyImages?: boolean;
  className?: string;
}

export default function MediaSelector({
  onSelect,
  onChange,
  value,
  selectedUrl,
  triggerButtonLabel = 'اختر ملف وسائط',
  triggerButtonIcon = <Image className="ml-2 h-4 w-4" />,
  showPreview = true,
  previewSize = 'medium',
  allowClear = true,
  onClear,
  onlyImages = true,
  className,
}: MediaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState<string>(onlyImages ? 'image' : 'all');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  
  // استلام ملفات الوسائط من الخادم
  const { data: mediaResponse, isLoading, isError } = useQuery<{ success: boolean; data: MediaFile[] }>({
    queryKey: ['/api/media'],
    queryFn: async () => {
      try {
        const mimeTypeFilter = fileType === 'image' ? 'image/' : '';
        const url = mimeTypeFilter 
          ? `/api/media?mimeType=${encodeURIComponent(mimeTypeFilter)}` 
          : '/api/media';
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'فشل في استلام ملفات الوسائط');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching media files:', error);
        throw error;
      }
    },
  });

  // استخراج مصفوفة الملفات من الاستجابة
  const mediaFiles = mediaResponse?.data || [];
  
  // تصفية الملفات حسب البحث
  const filteredFiles = mediaFiles.filter(file => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      file.originalFilename.toLowerCase().includes(term) ||
      (file.title || '').toLowerCase().includes(term) ||
      (file.alt || '').toLowerCase().includes(term)
    );
  });
  
  // عند اختيار ملف
  const handleSelect = (file: MediaFile) => {
    setSelectedFile(file);
    
    // دعم كلا من onSelect و onChange
    if (onSelect) {
      onSelect(file);
    }
    
    if (onChange) {
      onChange(file.url);
    }
    
    setIsOpen(false);
  };
  
  // عند مسح الملف المحدد
  const handleClear = () => {
    setSelectedFile(null);
    
    // دعم كل من onClear و onChange
    if (onClear) {
      onClear();
    }
    
    // إذا كان هناك دالة onChange، قم بتمرير قيمة فارغة لها
    if (onChange) {
      onChange("");
    }
  };
  
  // تعيين الملف المحدد عند تغيير العنوان المحدد أو القيمة
  useEffect(() => {
    // استخدم value إذا كان متاحًا، وإلا استخدم selectedUrl
    const urlToCheck = value || selectedUrl;
    
    if (urlToCheck && mediaFiles) {
      const file = mediaFiles.find(f => f.url === urlToCheck);
      if (file) {
        setSelectedFile(file);
      }
    } else {
      setSelectedFile(null);
    }
  }, [selectedUrl, value, mediaFiles]);

  return (
    <div className={className}>
      {showPreview && selectedFile && (
        <div className="mb-3 relative">
          <div className={cn(
            "border rounded-md overflow-hidden relative bg-gray-100 dark:bg-gray-800",
            {
              "h-20 w-20": previewSize === 'small',
              "h-32 w-32": previewSize === 'medium',
              "h-48 w-48": previewSize === 'large',
            }
          )}>
            <img 
              src={selectedFile.url} 
              alt={selectedFile.alt || selectedFile.originalFilename}
              className="object-contain w-full h-full" 
            />
            
            {allowClear && (
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={selectedFile ? "outline" : "default"} 
            className="flex items-center"
          >
            {triggerButtonIcon}
            {selectedFile ? 'تغيير الملف' : triggerButtonLabel}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>معرض الوسائط</DialogTitle>
            <DialogDescription>
              اختر ملفاً من معرض الوسائط
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الوسائط..."
                className="px-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-3 top-2.5 h-4 w-4 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="border rounded p-1 text-sm bg-white"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
              >
                {!onlyImages && <option value="all">جميع الملفات</option>}
                <option value="image">الصور فقط</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex-grow overflow-auto">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">جاري تحميل الملفات...</div>
            ) : isError ? (
              <div className="py-8 text-center text-destructive">حدث خطأ أثناء تحميل الملفات</div>
            ) : filteredFiles.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد ملفات وسائط متاحة'}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                {filteredFiles.map((file) => (
                  <Card 
                    key={file.id}
                    className={cn(
                      "cursor-pointer border-2 transition-all h-36",
                      selectedFile?.id === file.id ? "border-primary" : "hover:border-primary/50"
                    )}
                    onClick={() => handleSelect(file)}
                  >
                    <CardContent className="p-2 h-full relative">
                      {file.mimeType.startsWith('image/') ? (
                        <div className="h-full w-full bg-muted rounded-sm overflow-hidden">
                          <img 
                            src={file.url} 
                            alt={file.alt || file.originalFilename}
                            className="object-contain w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted rounded-sm">
                          <div className="text-center">
                            <p className="text-xs truncate max-w-full">{file.originalFilename}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedFile?.id === file.id && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}