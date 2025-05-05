import React, { useEffect } from 'react';
import { useSiteSettings } from '../hooks/use-site-settings';

/**
 * مكون لتطبيق الألوان من إعدادات الموقع على متغيرات CSS
 */
const ThemeColors: React.FC = () => {
  const { siteSettings } = useSiteSettings();

  useEffect(() => {
    if (!siteSettings) return;

    // الهدف: إنشاء عنصر style لتطبيق الألوان مباشرة
    const primaryColor = siteSettings.primaryColor || '#3b82f6';
    const secondaryColor = siteSettings.secondaryColor || '#f59e0b';
    const accentColor = siteSettings.accentColor || '#a855f7';

    console.log('Applying theme colors directly:', {
      primaryColor,
      secondaryColor,
      accentColor
    });

    // إنشاء متغيرات CSS باستخدام عنصر style
    const primaryHsl = hexToHSL(primaryColor);
    const secondaryHsl = hexToHSL(secondaryColor);
    const accentHsl = hexToHSL(accentColor);

    // إنشاء أو تحديث عنصر style
    let styleElement = document.getElementById('theme-colors-style');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'theme-colors-style';
      document.head.appendChild(styleElement);
    }

    // تعيين محتوى CSS مباشرة
    styleElement.textContent = `
      :root {
        --primary: ${primaryHsl || '221 83% 53%'};
        --accent: ${secondaryHsl || '25 95% 53%'};
        --info: ${accentHsl || '262 83% 58%'};
        
        --primary-hex: ${primaryColor};
        --secondary-hex: ${secondaryColor};
        --accent-hex: ${accentColor};
      }
      
      /* تحسينات للألوان */
      .btn-primary, .bg-primary {
        background-color: ${primaryColor} !important;
      }
      
      .btn-secondary, .bg-secondary {
        background-color: ${secondaryColor} !important;
      }
      
      .btn-accent, .bg-accent {
        background-color: ${accentColor} !important;
      }
      
      .text-primary {
        color: ${primaryColor} !important;
      }
      
      .text-secondary {
        color: ${secondaryColor} !important;
      }
      
      .text-accent {
        color: ${accentColor} !important;
      }
      
      .border-primary {
        border-color: ${primaryColor} !important;
      }
    `;

  }, [siteSettings]);

  return null; // هذا المكون لا يعرض أي شيء في DOM
};

/**
 * تحويل لون هيكس إلى صيغة HSL
 */
function hexToHSL(hex: string): string | null {
  // التأكد من أن اللون يبدأ بـ #
  if (hex.charAt(0) !== '#') {
    hex = '#' + hex;
  }
  
  // التأكد من صحة الصيغة
  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    console.warn('Invalid hex color format:', hex);
    return null;
  }

  // تحويل HEX إلى RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h = Math.round(h * 60);
  }
  
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}

export default ThemeColors;
