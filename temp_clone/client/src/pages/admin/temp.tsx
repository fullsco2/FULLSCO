import React, { useState } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import RichEditor from '@/components/ui/rich-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TempPage() {
  const [content, setContent] = useState('');
  
  const handleEditorChange = (html: string) => {
    setContent(html);
    console.log('تم تحديث المحتوى:', html);
  };
  
  return (
    <AdminLayout title="اختبار محرر النص الغني">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">صفحة اختبار محرر النص الغني</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>اختبار إضافة الصور</CardTitle>
          </CardHeader>
          <CardContent>
            <RichEditor
              initialValue=""
              onChange={handleEditorChange}
              placeholder="اكتب شيئًا هنا... أو أضف صورة من خلال الزر المخصص"
              height={300}
            />
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">المحتوى الناتج:</h3>
              <div className="p-3 bg-muted rounded whitespace-pre-wrap font-mono text-xs">
                {content}
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">عرض المحتوى المعالج:</h3>
              <div 
                className="p-3 border rounded prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}