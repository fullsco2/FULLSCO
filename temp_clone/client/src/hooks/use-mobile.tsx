import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Custom hook لتحديد ما إذا كان العرض الحالي للشاشة هو عرض الموبايل
 * هذا الـhook يعمل مع SSR ويعالج حالات عدم وجود `window`
 * @returns وكائن يحتوي على خاصية isMobile
 */
export function useMobile() {
  // إعداد قيمة افتراضية للمتصفحات - false لضمان عدم تغيير الحالة من uncontrolled إلى controlled
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // استخدم MediaQueryList للتحقق من عرض الشاشة
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // دالة callback تعمل عندما يتغير عرض النافذة
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // إعداد القيمة الأولية مباشرة
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // إضافة مستمع لتغييرات حجم الشاشة
    mql.addEventListener("change", onChange)
    
    // تنظيف عند إلغاء تحميل المكون
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return { isMobile }
}

/**
 * نسخة بديلة من useMobile تعيد قيمة boolean مباشرة
 * للاستخدام في المكونات التي تحتاج فقط قيمة boolean
 * @returns قيمة boolean تشير إلى ما إذا كان الجهاز موبايل
 */
export const useIsMobile = (): boolean => {
  const { isMobile } = useMobile();
  return isMobile;
}
