'use client';

import Link from 'next/link';
import { Calendar, Tag } from 'lucide-react';
import { formatDate, truncateText } from '@/lib/utils';

interface ArticleListItemProps {
  article: any; // استخدام any للتوافق مع بيانات API الحالية
}

export default function ArticleListItem({ article }: ArticleListItemProps) {
  // تاريخ النشر
  const publishDate = article.createdAt
    ? formatDate(article.createdAt)
    : article.publishedAt
    ? formatDate(article.publishedAt)
    : null;
  
  // رابط المقال
  const articleUrl = `/articles/${article.slug || article.id}`;
  
  // صورة المقال
  const thumbnail = article.thumbnail || '/placeholder-article.jpg';

  return (
    <div className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row">
        {/* صورة المقال */}
        <Link href={articleUrl} className="block w-full md:w-1/4 h-48 md:h-auto overflow-hidden bg-gray-200 dark:bg-gray-800">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </Link>
        
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            {/* تصنيفات المقال */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {article.tags.slice(0, 3).map((tag: any) => (
                  <Link 
                    key={tag.id || tag} 
                    href={`/articles?tag=${tag.slug || tag.id || tag}`}
                    className="flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                  >
                    <Tag className="ml-1 h-3 w-3" />
                    <span>{typeof tag === 'object' ? tag.name : tag}</span>
                  </Link>
                ))}
              </div>
            )}
            
            {/* عنوان المقال */}
            <Link href={articleUrl}>
              <h2 className="mb-2 text-xl font-bold transition-colors group-hover:text-primary">
                {article.title}
              </h2>
            </Link>
            
            {/* ملخص المقال */}
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              {article.summary || article.excerpt || truncateText(article.content || article.description || '', 200)}
            </p>
          </div>
          
          {/* معلومات النشر */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            {publishDate && (
              <div className="flex items-center">
                <Calendar className="ml-1 h-3 w-3" />
                <span>{publishDate}</span>
              </div>
            )}
            
            {article.author && (
              <div>
                <span>{typeof article.author === 'object' ? article.author.name : article.author}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
