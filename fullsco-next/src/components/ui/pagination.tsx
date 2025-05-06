import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  siblingsCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  siblingsCount = 1,
}: PaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // First page
    if (showFirstLast && currentPage > 1 + siblingsCount) {
      pageNumbers.push(1);
      if (currentPage > 2 + siblingsCount) {
        pageNumbers.push('ellipsis');
      }
    }
    
    // Siblings pages before current
    for (let i = Math.max(1, currentPage - siblingsCount); i < currentPage; i++) {
      pageNumbers.push(i);
    }
    
    // Current page
    pageNumbers.push(currentPage);
    
    // Siblings pages after current
    for (let i = currentPage + 1; i <= Math.min(totalPages, currentPage + siblingsCount); i++) {
      pageNumbers.push(i);
    }
    
    // Last page
    if (showFirstLast && currentPage < totalPages - siblingsCount) {
      if (currentPage < totalPages - 1 - siblingsCount) {
        pageNumbers.push('ellipsis');
      }
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {getPageNumbers().map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="px-3 py-1.5">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }
        
        return (
          <Button
            key={page}
            onClick={() => onPageChange(page as number)}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
