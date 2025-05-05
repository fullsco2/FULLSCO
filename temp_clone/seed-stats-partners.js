// سكريبت لإضافة بيانات تجريبية للإحصائيات والشركاء
// ملاحظة: هذا الملف مؤقت وسيتم استخدامه مرة واحدة فقط لإضافة بيانات تجريبية

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// بيانات تجريبية للإحصائيات
const statisticsData = [
  {
    title: "منح دراسية",
    value: "+1000",
    description: "منح دراسية متاحة حاليًا",
    icon: "award",
    color: "#3b82f6",
    isActive: true
  },
  {
    title: "طلاب مستفيدون",
    value: "15000+",
    description: "طالب استفاد من منصتنا",
    icon: "users",
    color: "#f59e0b",
    isActive: true
  },
  {
    title: "دول",
    value: "25",
    description: "دولة تقدم منح دراسية",
    icon: "globe",
    color: "#a855f7",
    isActive: true
  },
  {
    title: "تخصصات",
    value: "100+",
    description: "تخصص متاح للدراسة",
    icon: "book",
    color: "#10b981",
    isActive: true
  }
];

// بيانات تجريبية للشركاء
const partnersData = [
  {
    name: "جامعة الملك عبدالله للعلوم والتقنية",
    logoUrl: "https://fakeimg.pl/400x200/f0f0f0/a6a6a6/?text=KAUST&font=bebas",
    websiteUrl: "https://www.kaust.edu.sa",
    description: "جامعة بحثية رائدة في المملكة العربية السعودية",
    isActive: true
  },
  {
    name: "جامعة الملك سعود",
    logoUrl: "https://fakeimg.pl/400x200/f0f0f0/a6a6a6/?text=KSU&font=bebas",
    websiteUrl: "https://www.ksu.edu.sa",
    description: "أكبر جامعة في المملكة العربية السعودية",
    isActive: true
  },
  {
    name: "مؤسسة قطر",
    logoUrl: "https://fakeimg.pl/400x200/f0f0f0/a6a6a6/?text=QF&font=bebas",
    websiteUrl: "https://www.qf.org.qa",
    description: "مؤسسة تعليمية وبحثية رائدة في قطر",
    isActive: true
  },
  {
    name: "الجامعة الأمريكية في بيروت",
    logoUrl: "https://fakeimg.pl/400x200/f0f0f0/a6a6a6/?text=AUB&font=bebas",
    websiteUrl: "https://www.aub.edu.lb",
    description: "جامعة عريقة في لبنان",
    isActive: true
  },
  {
    name: "جامعة القاهرة",
    logoUrl: "https://fakeimg.pl/400x200/f0f0f0/a6a6a6/?text=CU&font=bebas",
    websiteUrl: "https://cu.edu.eg",
    description: "أقدم جامعة مصرية",
    isActive: true
  },
  {
    name: "منظمة اليونسكو",
    logoUrl: "https://fakeimg.pl/400x200/f0f0f0/a6a6a6/?text=UNESCO&font=bebas",
    websiteUrl: "https://www.unesco.org",
    description: "منظمة الأمم المتحدة للتربية والعلم والثقافة",
    isActive: true
  }
];

async function seedData() {
  try {
    const client = await pool.connect();
    
    try {
      // إضافة بيانات الإحصائيات
      for (const stat of statisticsData) {
        // التحقق من وجود الإحصائية
        const checkStat = await client.query(
          'SELECT id FROM statistics WHERE title = $1',
          [stat.title]
        );
        
        if (checkStat.rows.length === 0) {
          // إضافة إحصائية جديدة
          await client.query(
            `INSERT INTO statistics 
            (title, value, description, icon, color, is_active) 
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [stat.title, stat.value, stat.description, stat.icon, stat.color, stat.isActive]
          );
          console.log(`تمت إضافة إحصائية: ${stat.title}`);
        } else {
          console.log(`الإحصائية ${stat.title} موجودة بالفعل`);
        }
      }
      
      // إضافة بيانات الشركاء
      for (const partner of partnersData) {
        // التحقق من وجود الشريك
        const checkPartner = await client.query(
          'SELECT id FROM partners WHERE name = $1',
          [partner.name]
        );
        
        if (checkPartner.rows.length === 0) {
          // إضافة شريك جديد
          await client.query(
            `INSERT INTO partners 
            (name, logo_url, website_url, description, is_active) 
            VALUES ($1, $2, $3, $4, $5)`,
            [partner.name, partner.logoUrl, partner.websiteUrl, partner.description, partner.isActive]
          );
          console.log(`تمت إضافة شريك: ${partner.name}`);
        } else {
          console.log(`الشريك ${partner.name} موجود بالفعل`);
        }
      }
      
      console.log('تمت إضافة البيانات التجريبية بنجاح');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('خطأ في إضافة البيانات:', error);
  } finally {
    await pool.end();
  }
}

seedData();