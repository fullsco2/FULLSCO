import { Link } from 'wouter';
import { 
  GraduationCap, 
  MapPin, 
  BookOpen, 
  BarChart, 
  Users, 
  Calendar,
  Loader2
} from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';
import { Category } from '@shared/schema';

// Iconos para las categorías
const categoryIcons = {
  'degree': GraduationCap,
  'destination': MapPin,
  'field': BookOpen,
  'funding': BarChart,
  'eligibility': Users,
  'deadline': Calendar
};

// Categorías estáticas para mostrar mientras se cargan los datos o como respaldo
const staticCategories = [
  {
    title: 'حسب المستوى الدراسي',
    description: 'بكالوريوس، ماجستير، دكتوراه',
    icon: GraduationCap,
    link: '/scholarships?type=degree'
  },
  {
    title: 'حسب الوجهة',
    description: 'الولايات المتحدة، المملكة المتحدة، كندا، أستراليا، أوروبا',
    icon: MapPin,
    link: '/scholarships?type=destination'
  },
  {
    title: 'حسب مجال الدراسة',
    description: 'الهندسة، الطب، الأعمال، الفنون',
    icon: BookOpen,
    link: '/scholarships?type=field'
  },
  {
    title: 'حسب نوع التمويل',
    description: 'تمويل كامل، جزئي، منح بحثية',
    icon: BarChart,
    link: '/scholarships?type=funding'
  },
  {
    title: 'حسب الأهلية',
    description: 'الطلاب الدوليين، حسب الجنسية',
    icon: Users,
    link: '/scholarships?type=eligibility'
  },
  {
    title: 'المواعيد النهائية القادمة',
    description: 'طلبات التقديم تقترب من الإغلاق',
    icon: Calendar,
    link: '/scholarships?type=deadline'
  }
];

const ScholarshipCategories = () => {
  // Obtener categorías de la base de datos
  const { data: categoriesData, isLoading, error } = useCategories();
  const categories = categoriesData as Category[] | undefined;

  // Función para obtener un icono basado en el slug de la categoría
  const getIconForCategory = (slug: string) => {
    // Extraer el tipo de la URL o usar el slug como clave
    const typeMatch = slug.match(/type=([a-zA-Z]+)/);
    const type = typeMatch ? typeMatch[1] : slug;
    
    // Buscar un icono que coincida con el tipo o slug
    return categoryIcons[type as keyof typeof categoryIcons] || BookOpen;
  };

  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold sm:text-3xl mb-4">تصفح المنح الدراسية حسب الفئة</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">اعثر على فرص المنح الدراسية التي تتناسب مع اهتماماتك الأكاديمية، أو بلد الوجهة، أو المستوى الدراسي.</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <span className="mr-2 text-muted-foreground">جاري تحميل التصنيفات...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">حدث خطأ أثناء تحميل التصنيفات</p>
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const IconComponent = getIconForCategory(category.slug);
              return (
                <Link key={category.id} href={`/scholarships?category=${category.id}`}>
                  <div className="group flex items-center p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description || `منح دراسية في مجال ${category.name}`}</p>
                    </div>
                    <ArrowRight className="mr-auto text-muted-foreground group-hover:text-primary h-4 w-4 rotate-180" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          // Si no hay categorías disponibles, mostrar las categorías estáticas
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {staticCategories.map((category, index) => (
              <Link key={index} href={category.link}>
                <div className="group flex items-center p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white">
                    <category.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <ArrowRight className="mr-auto text-muted-foreground group-hover:text-primary h-4 w-4 rotate-180" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default ScholarshipCategories;
