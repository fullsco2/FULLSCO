import { Switch, Route, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Scholarships from "@/pages/scholarships";
import ScholarshipDetail from "@/pages/scholarship-detail";
import Articles from "@/pages/articles";
import ArticleDetail from "@/pages/article-detail";
import StaticPage from "@/pages/static-page";
import PageById from "@/pages/page-by-id";

// استيراد صفحات قصص النجاح بشكل كسول
const SuccessStories = lazy(() => import("@/pages/success-stories"));
const SuccessStoryDetail = lazy(() => import("@/pages/success-story-detail"));

// Admin Components
import AdminDashboard from "@/pages/admin/dashboard";
import AdminScholarships from "@/pages/admin/scholarships";
import AdminPosts from "@/pages/admin/posts";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";
import AdminSEO from "@/pages/admin/seo";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminCategories from "@/pages/admin/categories";
import AdminLevels from "@/pages/admin/levels";
import AdminCountries from "@/pages/admin/countries";
import AdminSiteSettings from "@/pages/admin/site-settings"; // نستخدم واجهة واحدة فقط لإعدادات الموقع
import AdminPages from "@/pages/admin/pages";
import HomeSectionsSettings from "@/pages/admin/settings/home-sections";

import AdminMenus from "@/pages/admin/menus-new";
import AdminMedia from "@/pages/admin/media";
import AdminRoles from "@/pages/admin/roles";
import AdminBackups from "@/pages/admin/backups";
import AdminLogin from "@/pages/admin/login";

// استيراد صفحات الإنشاء الجديدة
import CreateScholarship from "@/pages/admin/scholarships/create";
import CreatePost from "@/pages/admin/posts/create";
import CreatePage from "@/pages/admin/pages/create";
import EditPage from "@/pages/admin/pages/edit";

// New Admin Dashboard Component
import NewDashboard from "@/pages/admin/new-dashboard";

// New Admin Pages
import AdminSubscribers from "@/pages/admin/subscribers";
import AdminSuccessStories from "@/pages/admin/success-stories";
// استيراد صفحات الإحصائيات بشكل مباشر
import AdminStatistics from "@/pages/admin/statistics/index";
import CreateStatistic from "@/pages/admin/statistics/create";
import EditStatistic from "@/pages/admin/statistics/edit";

// استيراد صفحات الشركاء بشكل مباشر
import AdminPartners from "@/pages/admin/partners/index";
import CreatePartner from "@/pages/admin/partners/create";
import EditPartner from "@/pages/admin/partners/edit";

// استيراد صفحات إعدادات الموقع الجديدة
import GeneralSettings from "@/pages/admin/settings/general";
import AppearanceSettings from "@/pages/admin/settings/appearance";
import ContactSettings from "@/pages/admin/settings/contact";
import SocialSettings from "@/pages/admin/settings/social";
// الصفحات المحذوفة
import AdminMessages from "@/pages/admin/messages";
import CreateSuccessStory from "@/pages/admin/create-success-story";
import EditSuccessStory from "@/pages/admin/edit-success-story";
import TempPage from "@/pages/admin/temp";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { useEffect } from "react";
import ThemeColors from "./components/theme-colors";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { SiteSettingsProvider } from "@/hooks/use-site-settings";
import { ScholarshipsProvider } from "@/hooks/use-scholarships";
import { PostsProvider } from "@/hooks/use-posts";
import { SuccessStoriesProvider } from "@/hooks/use-success-stories";
import { FilterOptionsProvider } from "@/hooks/use-filter-options";

function App() {
  // Get current location to determine if we're on an admin page
  const [location] = useLocation();
  const isAdminPage = location.startsWith("/admin");
  const isAdminDashboard = location === "/admin/dashboard" || location === "/admin";
  const isNewAdminDashboard = location === "/admin/new";

  // Add metadata to document head
  useEffect(() => {
    document.title = "FULLSCO - منصة المنح الدراسية";
    
    // ملاحظة: لا نقوم بتعيين dir و lang هنا
    // لأنه سيتم تعيينها عن طريق SiteSettingsProvider
    // وفقاً للإعدادات المخزنة في قاعدة البيانات
    
    // مهم: تأكد من أن overflow يعمل بشكل صحيح عند تنظيف المكون
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // تأكد من تمكين التمرير وانتقال الصفحة للأعلى عند تغيير المسار
  useEffect(() => {
    document.body.style.overflow = '';
    window.scrollTo(0, 0);
  }, [location]);

  // تغليف صفحات لوحة التحكم بمزود الإشعارات
  const wrapInNotificationProvider = (component: React.ReactNode) => {
    if (isAdminPage && location !== '/admin/login') {
      return (
        <NotificationProvider>
          {component}
        </NotificationProvider>
      );
    }
    return component;
  };

  return (
    <SiteSettingsProvider>
      <ScholarshipsProvider>
        <PostsProvider>
          <SuccessStoriesProvider>
            <FilterOptionsProvider>
              <TooltipProvider>
                {/* مكون لتطبيق ألوان إعدادات الموقع */}
                <ThemeColors />
                {!isAdminPage && <Header />}
                {wrapInNotificationProvider(
                  <Switch>
                    {/* Public routes */}
                    <Route path="/" component={Home} />
                    <Route path="/scholarships" component={Scholarships} />
                    <Route path="/scholarships/:slug" component={ScholarshipDetail} />
                    <Route path="/articles" component={Articles} />
                    <Route path="/articles/:slug" component={ArticleDetail} />
                    {/* مسارات قصص النجاح */}
                    <Route path="/success-stories">
                      {() => (
                        <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]">جاري التحميل...</div>}>
                          <SuccessStories />
                        </Suspense>
                      )}
                    </Route>
                    <Route path="/success-stories/:slug">
                      {() => (
                        <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]">جاري التحميل...</div>}>
                          <SuccessStoryDetail />
                        </Suspense>
                      )}
                    </Route>
                    {/* مسارات الصفحات العامة باستخدام السلاق والمعرف */}
                    <Route path="/page/:slug" component={StaticPage} />
                    <Route path="/pages/:id" component={PageById} />
                    
                    {/* مسار عام للصفحات باستخدام السلاق مباشرة - مثل /about-us */}
                    <Route path="/:slug" component={StaticPage} />
                    
                    {/* Admin Login */}
                    <Route path="/admin/login" component={AdminLogin} />
                    
                    {/* New Admin Dashboard */}
                    <Route path="/admin/new" component={NewDashboard} />
                    
                    {/* Root Admin Route - Redirects to Dashboard */}
                    <Route path="/admin" component={AdminDashboard} />
                    
                    {/* Original Admin Routes */}
                    <Route path="/admin/dashboard" component={AdminDashboard} />
                    <Route path="/admin/scholarships" component={AdminScholarships} />
                    <Route path="/admin/scholarships/create" component={CreateScholarship} />
                    <Route path="/admin/scholarships/edit/:id" component={CreateScholarship} />
                    <Route path="/admin/categories" component={AdminCategories} />
                    <Route path="/admin/levels" component={AdminLevels} />
                    <Route path="/admin/countries" component={AdminCountries} />
                    <Route path="/admin/posts" component={AdminPosts} />
                    <Route path="/admin/posts/create" component={CreatePost} />
                    <Route path="/admin/posts/edit/:id" component={CreatePost} />
                    <Route path="/admin/users" component={AdminUsers} />
                    <Route path="/admin/settings" component={AdminSettings} />
                    
                    {/* إضافة مسارات صفحات إعدادات الموقع الجديدة */}
                    <Route path="/admin/settings/general" component={GeneralSettings} />
                    <Route path="/admin/settings/appearance" component={AppearanceSettings} />
                    <Route path="/admin/settings/contact" component={ContactSettings} />
                    <Route path="/admin/settings/social" component={SocialSettings} />
                    <Route path="/admin/settings/home-sections" component={HomeSectionsSettings} />
                    
                    {/* المسار القديم لإعدادات الموقع (سيتم استبداله لاحقاً) */}
                    <Route path="/admin/site-settings" component={AdminSiteSettings} />
                    <Route path="/admin/pages" component={AdminPages} />
                    <Route path="/admin/pages/create" component={CreatePage} />
                    <Route path="/admin/pages/edit/:id" component={EditPage} />
                    <Route path="/admin/menus" component={AdminMenus} />
                    <Route path="/admin/media" component={AdminMedia} />
                    <Route path="/admin/roles" component={AdminRoles} />
                    <Route path="/admin/backups" component={AdminBackups} />
                    <Route path="/admin/seo" component={AdminSEO} />
                    <Route path="/admin/analytics" component={AdminAnalytics} />

                    {/* New Admin Routes */}
                    <Route path="/admin/subscribers" component={AdminSubscribers} />
                    <Route path="/admin/success-stories" component={AdminSuccessStories} />
                    <Route path="/admin/success-stories/create" component={CreateSuccessStory} />
                    <Route path="/admin/success-stories/edit/:id" component={EditSuccessStory} />
                    
                    {/* مسارات الإحصائيات المحدثة */}
                    <Route path="/admin/statistics" component={AdminStatistics} />
                    <Route path="/admin/statistics/create" component={CreateStatistic} />
                    <Route path="/admin/statistics/edit/:id" component={EditStatistic} />
                    
                    {/* مسارات الشركاء المحدثة */}
                    <Route path="/admin/partners" component={AdminPartners} />
                    <Route path="/admin/partners/create" component={CreatePartner} />
                    <Route path="/admin/partners/edit/:id" component={EditPartner} />
                    
                    {/* تم حذف مسارات home-layout و appearance */}
                    <Route path="/admin/messages" component={AdminMessages} />
                    <Route path="/admin/temp" component={TempPage} />
                    
                    {/* Fallback to 404 */}
                    <Route component={NotFound} />
                  </Switch>
                )}
                {!isAdminPage && <Footer />}
              </TooltipProvider>
            </FilterOptionsProvider>
          </SuccessStoriesProvider>
        </PostsProvider>
      </ScholarshipsProvider>
    </SiteSettingsProvider>
  );
}

export default App;
