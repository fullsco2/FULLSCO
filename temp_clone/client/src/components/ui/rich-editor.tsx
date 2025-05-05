import React, { useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import MediaSelector from '@/components/ui/media-selector';

import CharacterCount from '@tiptap/extension-character-count';
import Heading from '@tiptap/extension-heading';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  CheckCircle, 
  Edit, 
  Image as ImageIcon, 
  BarChart2, 
  Search, 
  Settings, 
  FileText, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Code, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Heading1, 
  Heading2, 
  Heading3, 
  Strikethrough, 
  Link as LinkIcon, 
  Table as TableIcon,
  RotateCcw,
  RotateCw,
  Highlighter,
  Palette
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RichEditorProps {
  initialValue?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number | string;
  minHeight?: number | string;
  dir?: 'rtl' | 'ltr';
  seoTitle?: string;
  onSeoTitleChange?: (title: string) => void;
  seoDescription?: string;
  onSeoDescriptionChange?: (description: string) => void;
  seoKeywords?: string;
  onSeoKeywordsChange?: (keywords: string) => void;
  focusKeyword?: string;
  onFocusKeywordChange?: (keyword: string) => void;
  readOnly?: boolean;
  className?: string;
}

export default function RichEditor({
  initialValue = '',
  onChange,
  placeholder = 'ابدأ الكتابة هنا...',
  height = 500,
  minHeight = 400,
  dir = 'rtl',
  seoTitle = '',
  onSeoTitleChange,
  seoDescription = '',
  onSeoDescriptionChange,
  seoKeywords = '',
  onSeoKeywordsChange,
  focusKeyword = '',
  onFocusKeywordChange,
  readOnly = false,
  className = '',
}: RichEditorProps) {
  const [content, setContent] = useState(() => {
    // تصحيح القيمة الأولية لتجنب قيم null أو undefined
    if (initialValue === null || initialValue === undefined) return '';
    return initialValue;
  });
  
  // طباعة قيمة المحتوى الأولي للتأكد من أنه يتم تلقيه بشكل صحيح
  console.log("المحتوى الأولي للمحرر:", initialValue);
  
  const [activeTab, setActiveTab] = useState('editor');
  const [wordCount, setWordCount] = useState(0);
  const [seoScore, setSeoScore] = useState(0);
  const [readability, setReadability] = useState(0);
  const [seoAnalysis, setSeoAnalysis] = useState<Array<{text: string, status: 'good' | 'warning' | 'bad', score: number}>>([]);
  const [readabilityAnalysis, setReadabilityAnalysis] = useState<Array<{text: string, status: 'good' | 'warning' | 'bad', score: number}>>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false);
  
  // تنقية القيمة الأولية من القيم الفارغة أو غير المحددة
  const safeInitialValue = (() => {
    if (initialValue === null || initialValue === undefined) return '';
    return initialValue;
  })();
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // we'll configure it separately
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          // إضافة فئات CSS للحفاظ على استقرار الصور
          class: 'rich-editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: dir === 'rtl' ? 'right' : 'left',
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      CharacterCount.configure({
        limit: 10000,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    editorProps: {
      attributes: {
        dir,
        class: 'prose prose-lg dark:prose-invert focus:outline-none p-4 rounded-md min-h-[300px]',
        style: `height: ${typeof height === 'number' ? `${height}px` : height}; min-height: ${typeof minHeight === 'number' ? `${minHeight}px` : minHeight};`,
      },
    },
    content: safeInitialValue,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      onChange(html);
      
      // طباعة المحتوى الناتج للتأكد من تحديثه
      console.log("محتوى المحرر محدث:", html);
      
      // حساب عدد الكلمات
      const textContent = stripHtml(html);
      const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      
      // تحليل SEO وقابلية القراءة إذا كان هناك كلمة رئيسية
      if (focusKeyword) {
        analyzeSeo(html, focusKeyword, seoTitle, seoDescription);
        analyzeReadability(textContent);
      }
    },
  });
  
  // عند تغيير القيمة الأولية، نقوم بتحديث المحرر
  React.useEffect(() => {
    if (editor) {
      // تجهيز قيمة آمنة للمحتوى
      const safeValue = initialValue !== null && initialValue !== undefined ? initialValue : '';
      // تحقق من أن المحتوى الحالي مختلف عن المحتوى الجديد
      const currentContent = editor.getHTML();
      
      console.log("-> محاولة تحديث المحرر:", {
        currentContent,
        newContent: safeValue,
        isDifferent: currentContent !== safeValue
      });
      
      if (currentContent !== safeValue) {
        console.log("تحديث محتوى المحرر من القيمة الأولية:", safeValue);
        // تأخير قليل لضمان استقرار المحرر
        setTimeout(() => {
          if (editor) {
            editor.commands.setContent(safeValue);
            console.log("تم تحديث محتوى المحرر");
          }
        }, 50);
      }
    }
  }, [editor, initialValue]);
  
  // نقوم بإعادة تحميل المحتوى إذا تغير بشكل كبير
  React.useEffect(() => {
    if (editor && initialValue && initialValue.length > 20) {
      const currentContent = editor.getHTML();
      // إذا كان الفرق كبيرًا وليس مجرد تنسيق بسيط
      if (Math.abs(currentContent.length - initialValue.length) > 50) {
        console.log("فرق كبير في المحتوى - إعادة تحميل:", {
          currentLength: currentContent.length,
          newLength: initialValue.length
        });
        editor.commands.setContent(initialValue);
      }
    }
  }, [editor, initialValue]);
  
  // تحليل السيو
  const analyzeSeo = (content: string, keyword: string, title: string, description: string) => {
    const analysis: Array<{text: string, status: 'good' | 'warning' | 'bad', score: number}> = [];
    const textContent = stripHtml(content).toLowerCase();
    const keywordLower = keyword.toLowerCase();
    
    // التحقق من وجود الكلمة المفتاحية في العنوان
    if (title.toLowerCase().includes(keywordLower)) {
      analysis.push({
        text: 'الكلمة المفتاحية موجودة في العنوان',
        status: 'good',
        score: 15
      });
    } else {
      analysis.push({
        text: 'الكلمة المفتاحية غير موجودة في العنوان',
        status: 'bad',
        score: 0
      });
    }
    
    // التحقق من وجود الكلمة المفتاحية في الوصف
    if (description.toLowerCase().includes(keywordLower)) {
      analysis.push({
        text: 'الكلمة المفتاحية موجودة في الوصف',
        status: 'good',
        score: 10
      });
    } else {
      analysis.push({
        text: 'الكلمة المفتاحية غير موجودة في الوصف',
        status: 'bad',
        score: 0
      });
    }
    
    // التحقق من وجود الكلمة المفتاحية في أول 100 كلمة
    const first100Words = textContent.split(' ').slice(0, 100).join(' ');
    if (first100Words.includes(keywordLower)) {
      analysis.push({
        text: 'الكلمة المفتاحية موجودة في بداية المحتوى',
        status: 'good',
        score: 10
      });
    } else {
      analysis.push({
        text: 'الكلمة المفتاحية غير موجودة في بداية المحتوى',
        status: 'warning',
        score: 5
      });
    }
    
    // كثافة الكلمة المفتاحية
    const keywordCount = (textContent.match(new RegExp(keywordLower, 'g')) || []).length;
    const wordCount = textContent.split(' ').length;
    const keywordDensity = (keywordCount / wordCount) * 100;
    
    if (keywordDensity > 0.5 && keywordDensity < 2.5) {
      analysis.push({
        text: `كثافة الكلمة المفتاحية مثالية (${keywordDensity.toFixed(1)}%)`,
        status: 'good',
        score: 15
      });
    } else if (keywordDensity > 0 && keywordDensity <= 0.5) {
      analysis.push({
        text: `كثافة الكلمة المفتاحية منخفضة (${keywordDensity.toFixed(1)}%)`,
        status: 'warning',
        score: 7
      });
    } else if (keywordDensity >= 2.5 && keywordDensity < 4) {
      analysis.push({
        text: `كثافة الكلمة المفتاحية مرتفعة قليلاً (${keywordDensity.toFixed(1)}%)`,
        status: 'warning',
        score: 7
      });
    } else if (keywordDensity >= 4) {
      analysis.push({
        text: `كثافة الكلمة المفتاحية مرتفعة جداً (${keywordDensity.toFixed(1)}%)`,
        status: 'bad',
        score: 0
      });
    } else {
      analysis.push({
        text: 'الكلمة المفتاحية غير موجودة في المحتوى',
        status: 'bad',
        score: 0
      });
    }
    
    // التحقق من العناوين الفرعية (Headers)
    if (content.toLowerCase().includes('<h2') || content.toLowerCase().includes('<h3')) {
      analysis.push({
        text: 'تم استخدام العناوين الفرعية',
        status: 'good',
        score: 10
      });
      
      // التحقق من وجود الكلمة المفتاحية في العناوين الفرعية
      const headings = content.match(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/gi) || [];
      let keywordInHeadings = false;
      
      for (const heading of headings) {
        const headingText = stripHtml(heading).toLowerCase();
        if (headingText.includes(keywordLower)) {
          keywordInHeadings = true;
          break;
        }
      }
      
      if (keywordInHeadings) {
        analysis.push({
          text: 'الكلمة المفتاحية موجودة في العناوين الفرعية',
          status: 'good',
          score: 10
        });
      } else {
        analysis.push({
          text: 'الكلمة المفتاحية غير موجودة في العناوين الفرعية',
          status: 'warning',
          score: 5
        });
      }
    } else {
      analysis.push({
        text: 'لم يتم استخدام العناوين الفرعية',
        status: 'bad',
        score: 0
      });
    }
    
    // التحقق من طول المحتوى
    if (wordCount >= 800) {
      analysis.push({
        text: 'طول المحتوى ممتاز (أكثر من 800 كلمة)',
        status: 'good',
        score: 10
      });
    } else if (wordCount >= 500) {
      analysis.push({
        text: 'طول المحتوى جيد (أكثر من 500 كلمة)',
        status: 'good',
        score: 7
      });
    } else if (wordCount >= 300) {
      analysis.push({
        text: 'طول المحتوى متوسط (أكثر من 300 كلمة)',
        status: 'warning',
        score: 5
      });
    } else {
      analysis.push({
        text: 'طول المحتوى قصير جداً (أقل من 300 كلمة)',
        status: 'bad',
        score: 2
      });
    }
    
    // التحقق من وجود الصور
    if (content.toLowerCase().includes('<img')) {
      analysis.push({
        text: 'تم استخدام الصور في المحتوى',
        status: 'good',
        score: 10
      });
      
      // التحقق من وجود النص البديل في الصور
      const images = content.match(/<img[^>]*>/gi) || [];
      let allImagesHaveAlt = true;
      
      for (const img of images) {
        if (!img.includes('alt=') || img.includes('alt=""') || img.includes('alt=\'\'')) {
          allImagesHaveAlt = false;
          break;
        }
      }
      
      if (allImagesHaveAlt) {
        analysis.push({
          text: 'جميع الصور تحتوي على نص بديل',
          status: 'good',
          score: 5
        });
      } else {
        analysis.push({
          text: 'بعض الصور لا تحتوي على نص بديل',
          status: 'bad',
          score: 0
        });
      }
    } else {
      analysis.push({
        text: 'لم يتم استخدام الصور في المحتوى',
        status: 'warning',
        score: 3
      });
    }
    
    // التحقق من وجود الروابط
    if (content.toLowerCase().includes('<a')) {
      analysis.push({
        text: 'تم استخدام الروابط في المحتوى',
        status: 'good',
        score: 5
      });
    } else {
      analysis.push({
        text: 'لم يتم استخدام الروابط في المحتوى',
        status: 'warning',
        score: 2
      });
    }
    
    // حساب النتيجة الإجمالية
    const totalScore = analysis.reduce((sum, item) => sum + item.score, 0);
    const maxScore = 100; // النتيجة القصوى
    const finalScore = Math.round((totalScore / maxScore) * 100);
    
    setSeoAnalysis(analysis);
    setSeoScore(finalScore);
  };
  
  // تحليل قابلية القراءة
  const analyzeReadability = (text: string) => {
    const analysis: Array<{text: string, status: 'good' | 'warning' | 'bad', score: number}> = [];
    
    // تقسيم النص إلى جمل
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordCount = text.split(/\s+/).filter(w => w.trim().length > 0).length;
    
    // متوسط طول الجملة
    const avgSentenceLength = wordCount / (sentences.length || 1);
    
    if (avgSentenceLength <= 15) {
      analysis.push({
        text: 'متوسط طول الجملة جيد جداً',
        status: 'good',
        score: 20
      });
    } else if (avgSentenceLength <= 20) {
      analysis.push({
        text: 'متوسط طول الجملة جيد',
        status: 'good',
        score: 15
      });
    } else if (avgSentenceLength <= 25) {
      analysis.push({
        text: 'متوسط طول الجملة مقبول',
        status: 'warning',
        score: 10
      });
    } else {
      analysis.push({
        text: 'متوسط طول الجملة طويل جداً',
        status: 'bad',
        score: 5
      });
    }
    
    // تحقق من الفقرات الطويلة
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    const longParagraphs = paragraphs.filter(p => {
      const paraWords = p.split(/\s+/).filter(w => w.trim().length > 0);
      return paraWords.length > 100;
    });
    
    if (longParagraphs.length === 0) {
      analysis.push({
        text: 'جميع الفقرات بطول مناسب',
        status: 'good',
        score: 20
      });
    } else if (longParagraphs.length <= paragraphs.length * 0.2) {
      analysis.push({
        text: 'بعض الفقرات طويلة',
        status: 'warning',
        score: 10
      });
    } else {
      analysis.push({
        text: 'معظم الفقرات طويلة جداً',
        status: 'bad',
        score: 5
      });
    }
    
    // تحقق من وجود العناوين الفرعية
    if (sentences.length > 20) {
      analysis.push({
        text: 'يجب استخدام العناوين الفرعية لتقسيم المحتوى الطويل',
        status: 'warning',
        score: 10
      });
    }
    
    // الكلمات الصعبة - هذا محاكاة فقط (يحتاج لقاموس حقيقي)
    const complexWordRatio = 0.15; // افتراضي
    
    if (complexWordRatio < 0.1) {
      analysis.push({
        text: 'نسبة الكلمات الصعبة منخفضة',
        status: 'good',
        score: 20
      });
    } else if (complexWordRatio < 0.15) {
      analysis.push({
        text: 'نسبة الكلمات الصعبة مقبولة',
        status: 'good',
        score: 15
      });
    } else if (complexWordRatio < 0.2) {
      analysis.push({
        text: 'نسبة الكلمات الصعبة متوسطة',
        status: 'warning',
        score: 10
      });
    } else {
      analysis.push({
        text: 'نسبة الكلمات الصعبة مرتفعة',
        status: 'bad',
        score: 5
      });
    }
    
    // استخدام الصيغة المبنية للمعلوم (هذا سيكون تقريبي في النسخة العربية)
    analysis.push({
      text: 'استخدم صيغة المبني للمعلوم بدل المبني للمجهول',
      status: 'warning',
      score: 10
    });
    
    // حساب النتيجة الإجمالية
    const totalScore = analysis.reduce((sum, item) => sum + item.score, 0);
    const maxScore = 100; // النتيجة القصوى
    const finalScore = Math.round((totalScore / maxScore) * 100);
    
    setReadabilityAnalysis(analysis);
    setReadability(finalScore);
  };
  
  // Helper function to strip HTML tags
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };
  
  // وظائف التحرير
  const addLink = useCallback(() => {
    if (!editor) return;
    
    if (linkUrl) {
      // إضافة الرابط
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl, target: '_blank' })
        .run();
      
      setLinkUrl('');
      setIsLinkPopoverOpen(false);
    } else if (editor.isActive('link')) {
      // إزالة الرابط
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .run();
    }
  }, [editor, linkUrl]);
  
  // إضافة صورة باستخدام الرابط
  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    
    editor
      .chain()
      .focus()
      .setImage({ src: imageUrl, alt: 'صورة' })
      .run();
    
    setImageUrl('');
    setIsImagePopoverOpen(false);
  }, [editor, imageUrl]);
  
  // واجهة ملف الوسائط من MediaSelector
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
  
  // إضافة صورة من معرض الوسائط
  const handleMediaSelect = useCallback((mediaFile: MediaFile) => {
    if (!editor) return;
    
    // تحسين معالجة الصور مع تأكيد أن URL الصورة كامل
    const imageUrl = mediaFile.url.startsWith('/') 
      ? mediaFile.url // استخدم المسار كما هو إذا كان مطلقًا
      : `/${mediaFile.url}`; // وإلا أضف / في البداية
    
    console.log('إضافة صورة:', {
      originalUrl: mediaFile.url,
      processedUrl: imageUrl,
      altText: mediaFile.alt || mediaFile.title || mediaFile.originalFilename || 'صورة'
    });
    
    editor
      .chain()
      .focus()
      .setImage({ 
        src: imageUrl, 
        alt: mediaFile.alt || mediaFile.title || mediaFile.originalFilename || 'صورة' 
      })
      .run();
      
    // تأكيد أن المحتوى حُفظ
    const html = editor.getHTML();
    setContent(html);
    onChange(html);
  }, [editor, onChange]);
  
  // التعامل مع اتجاه النص
  const changeDirection = useCallback((newDir: 'rtl' | 'ltr') => {
    if (!editor) return;
    
    editor.commands.updateAttributes('root', { dir: newDir });
  }, [editor]);
  
  // إضافة جدول
  const addTable = useCallback(() => {
    if (!editor) return;
    
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);
  
  // منع التحرير إذا كان للقراءة فقط
  if (readOnly && editor) {
    editor.setEditable(false);
  }
  
  return (
    <div className={`rich-editor ${className}`} style={{ direction: dir }}>
      <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-white dark:bg-gray-800 border">
          <TabsTrigger value="editor">
            <Edit className="h-4 w-4 ml-2" />
            المحرر
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Search className="h-4 w-4 ml-2" />
            تحسين SEO
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart2 className="h-4 w-4 ml-2" />
            تحليل المحتوى
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 ml-2" />
            إعدادات
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="mt-0">
          {wordCount > 0 && (
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{wordCount} كلمة</span>
              {editor && (
                <span className="mr-auto">
                  {editor.storage.characterCount.characters()} حرفاً
                </span>
              )}
            </div>
          )}
          
          {editor && (
            <div className="border rounded-md mb-3">
              <div className="bg-muted py-1 px-2 flex flex-wrap gap-1 items-center border-b">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-accent' : ''}`}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={readOnly}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>عريض</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-accent' : ''}`}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={readOnly}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>مائل</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive('underline') ? 'bg-accent' : ''}`}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        disabled={readOnly}
                      >
                        <UnderlineIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>تسطير</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive('strike') ? 'bg-accent' : ''}`}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        disabled={readOnly}
                      >
                        <Strikethrough className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>خط في المنتصف</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="w-px h-6 bg-border mx-1" />
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}`}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        disabled={readOnly}
                      >
                        <Heading1 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>عنوان 1</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}`}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        disabled={readOnly}
                      >
                        <Heading2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>عنوان 2</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}`}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        disabled={readOnly}
                      >
                        <Heading3 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>عنوان 3</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="w-px h-6 bg-border mx-1" />
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive('bulletList') ? 'bg-accent' : ''}`}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        disabled={readOnly}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>قائمة نقطية</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive('orderedList') ? 'bg-accent' : ''}`}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        disabled={readOnly}
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>قائمة مرقمة</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="w-px h-6 bg-border mx-1" />
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}`}
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        disabled={readOnly}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>محاذاة لليسار</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}`}
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        disabled={readOnly}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>محاذاة للوسط</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}`}
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        disabled={readOnly}
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>محاذاة لليمين</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="w-px h-6 bg-border mx-1" />
                
                <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`h-8 w-8 ${editor.isActive('link') ? 'bg-accent' : ''}`}
                      disabled={readOnly}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="link-url">رابط URL</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="link-url"
                          placeholder="https://example.com"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                        />
                        <Button onClick={addLink}>إضافة</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Popover open={isImagePopoverOpen} onOpenChange={setIsImagePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      disabled={readOnly}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="image-url">رابط الصورة</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="image-url"
                          placeholder="https://example.com/image.jpg"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                        />
                        <Button onClick={addImage}>إضافة</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <MediaSelector
                          onSelect={handleMediaSelect}
                          triggerButtonLabel=""
                          triggerButtonIcon={<ImageIcon className="h-4 w-4" />}
                          showPreview={false}
                          onlyImages={true}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-transparent border-0"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>اختيار صورة من المكتبة</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive('table') ? 'bg-accent' : ''}`}
                        onClick={addTable}
                        disabled={readOnly}
                      >
                        <TableIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>إضافة جدول</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={`h-8 w-8 ${editor.isActive('code') ? 'bg-accent' : ''}`}
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        disabled={readOnly}
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>كتلة كود</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      disabled={readOnly}
                    >
                      <Highlighter className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="grid grid-cols-5 gap-1">
                      {['yellow', 'red', 'green', 'blue', 'purple'].map((color) => (
                        <Button
                          key={color}
                          variant="outline"
                          className="h-8 w-8 p-0"
                          style={{ backgroundColor: color }}
                          onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      disabled={readOnly}
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="grid grid-cols-5 gap-1">
                      {['#000000', '#0000ff', '#ff0000', '#008000', '#800080', '#ffa500', '#a52a2a', '#808080'].map((color) => (
                        <Button
                          key={color}
                          variant="outline"
                          className="h-8 w-8 p-0"
                          style={{ backgroundColor: color }}
                          onClick={() => editor.chain().focus().setColor(color).run()}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <div className="w-px h-6 bg-border mx-1" />
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={readOnly || !editor.can().undo()}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>تراجع</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={readOnly || !editor.can().redo()}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>إعادة</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="overflow-hidden">
                <EditorContent 
                  editor={editor} 
                  className="border-0"
                />
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="seo" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تحسين محركات البحث (SEO)</CardTitle>
              <CardDescription>تحليل وتحسين المحتوى لمحركات البحث</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">عنوان الصفحة (Title)</Label>
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(e) => onSeoTitleChange && onSeoTitleChange(e.target.value)}
                  placeholder="أدخل عنوان الصفحة..."
                  className="w-full"
                  maxLength={60}
                  dir={dir}
                  disabled={readOnly}
                />
                <div className="text-xs text-muted-foreground">
                  {seoTitle.length}/60 حرفاً
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seoDescription">وصف الصفحة (Meta Description)</Label>
                <Textarea
                  id="seoDescription"
                  value={seoDescription}
                  onChange={(e) => onSeoDescriptionChange && onSeoDescriptionChange(e.target.value)}
                  placeholder="أدخل وصف الصفحة..."
                  className="w-full"
                  maxLength={160}
                  dir={dir}
                  disabled={readOnly}
                />
                <div className="text-xs text-muted-foreground">
                  {seoDescription.length}/160 حرفاً
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seoKeywords">الكلمات المفتاحية (Meta Keywords)</Label>
                <Input
                  id="seoKeywords"
                  value={seoKeywords}
                  onChange={(e) => onSeoKeywordsChange && onSeoKeywordsChange(e.target.value)}
                  placeholder="كلمة مفتاحية 1, كلمة مفتاحية 2, ..."
                  className="w-full"
                  dir={dir}
                  disabled={readOnly}
                />
                <div className="text-xs text-muted-foreground">
                  افصل بين الكلمات المفتاحية بفواصل
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="focusKeyword">الكلمة المفتاحية الرئيسية</Label>
                <Input
                  id="focusKeyword"
                  value={focusKeyword}
                  onChange={(e) => onFocusKeywordChange && onFocusKeywordChange(e.target.value)}
                  placeholder="أدخل الكلمة المفتاحية الرئيسية..."
                  className="w-full"
                  dir={dir}
                  disabled={readOnly}
                />
                <div className="text-xs text-muted-foreground">
                  هذه الكلمة ستستخدم لتحليل وتحسين المحتوى
                </div>
              </div>
              
              {focusKeyword && seoAnalysis.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">درجة تحسين SEO</h3>
                    <Badge 
                      variant={seoScore > 70 ? "success" : seoScore > 40 ? "warning" : "destructive"}
                      className="ml-auto"
                    >
                      {seoScore}%
                    </Badge>
                  </div>
                  
                  <Progress value={seoScore} className="h-2 mb-4" />
                  
                  <div className="space-y-3">
                    {seoAnalysis.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        {item.status === 'good' ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : item.status === 'warning' ? (
                          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تحليل المحتوى</CardTitle>
              <CardDescription>معلومات وإحصائيات حول المحتوى</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">عدد الكلمات</div>
                  <div className="text-2xl font-bold">{wordCount}</div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">وقت القراءة التقريبي</div>
                  <div className="text-2xl font-bold">{Math.ceil(wordCount / 200)} دقائق</div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">قابلية القراءة</div>
                  <div className="text-2xl font-bold">{readability}%</div>
                </div>
              </div>
              
              {focusKeyword && readabilityAnalysis.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">تحليل قابلية القراءة</h3>
                    <Badge 
                      variant={readability > 70 ? "success" : readability > 40 ? "warning" : "destructive"}
                      className="ml-auto"
                    >
                      {readability}%
                    </Badge>
                  </div>
                  
                  <Progress value={readability} className="h-2 mb-4" />
                  
                  <div className="space-y-3">
                    {readabilityAnalysis.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        {item.status === 'good' ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : item.status === 'warning' ? (
                          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إعدادات المحرر</CardTitle>
              <CardDescription>تخصيص إعدادات المحرر</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editorDir">اتجاه النص</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={dir === 'rtl' ? "default" : "outline"}
                    onClick={() => changeDirection('rtl')}
                    className="flex-1"
                    disabled={readOnly}
                  >
                    من اليمين إلى اليسار (RTL)
                  </Button>
                  <Button
                    type="button"
                    variant={dir === 'ltr' ? "default" : "outline"}
                    onClick={() => changeDirection('ltr')}
                    className="flex-1"
                    disabled={readOnly}
                  >
                    من اليسار إلى اليمين (LTR)
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>إرشادات لتحسين محركات البحث</Label>
                <div className="text-sm text-muted-foreground">
                  <p>للحصول على أفضل نتائج في محركات البحث:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>استخدم العناوين الفرعية (H2, H3) لتقسيم المحتوى</li>
                    <li>استخدم الكلمة المفتاحية الرئيسية في العنوان والفقرة الأولى</li>
                    <li>أضف نصوص بديلة للصور (Alt Text)</li>
                    <li>اكتب محتوى لا يقل عن 500 كلمة للمقالات الأساسية</li>
                    <li>استخدم روابط داخلية وخارجية ذات صلة</li>
                    <li>ابدأ بالمعلومات الأكثر أهمية في بداية المقال</li>
                    <li>اكتب جملاً قصيرة وفقرات قصيرة لتحسين القراءة</li>
                    <li>استخدم كلمات مفتاحية طويلة (Long-tail keywords)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}