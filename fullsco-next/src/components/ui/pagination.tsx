import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, MoreHorizontal } from 'lucide-react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  // تجنب القيم غير الصالحة
  if (currentPage < 1) currentPage = 1;
  if (totalPages < 1) totalPages = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  // إذا كان إجمالي عدد الصفحات أقل من 7، فنعرض كل الأرقام
  if (totalPages <= 7) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            onClick={() => onPageChange(page)}
            aria-label={`الصفحة ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            className="w-9 h-9"
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="الصفحة التالية"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // إذا كان لدينا أكثر من 7 صفحات، نأخذ نهجًا مختلفًا
  let pages: (number | string)[] = [];
  
  // دائمًا نضيف الصفحة الأولى
  pages.push(1);
  
  // إضافة الصفحات السابقة للصفحة الحالية
  if (currentPage > 2) {
    if (currentPage > 3) {
      pages.push('...');
    }
    
    const start = Math.max(2, currentPage - siblingCount);
    for (let i = start; i < currentPage; i++) {
      pages.push(i);
    }
  }
  
  // إضافة الصفحة الحالية إذا لم تكن الصفحة الأولى
  if (currentPage !== 1 && currentPage !== totalPages) {
    pages.push(currentPage);
  }
  
  // إضافة الصفحات التالية للصفحة الحالية
  if (currentPage < totalPages - 1) {
    const end = Math.min(totalPages - 1, currentPage + siblingCount);
    for (let i = currentPage + 1; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage + siblingCount < totalPages - 1) {
      pages.push('...');
    }
  }
  
  // دائمًا نضيف الصفحة الأخيرة
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="الصفحة السابقة"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {pages.map((page, i) => {
        if (page === '...') {
          return (
            <Button 
              key={`ellipsis-${i}`} 
              variant="outline" 
              className="w-9 h-9 pointer-events-none" 
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            onClick={() => onPageChange(page as number)}
            aria-label={`الصفحة ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            className="w-9 h-9"
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="الصفحة التالية"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
