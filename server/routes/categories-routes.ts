import { Router } from 'express';
import { CategoriesController } from '../controllers/categories-controller';
import { isAdmin, isAuthenticated } from '../middlewares/auth-middleware';

// إنشاء موجه (router) جديد
const router = Router();
const controller = new CategoriesController();

/**
 * مسارات الفئات:
 * GET /api/categories - الحصول على جميع الفئات
 * GET /api/categories/:id - الحصول على فئة بواسطة المعرف
 * GET /api/categories/slug/:slug - الحصول على فئة بواسطة الاسم المستعار
 * POST /api/categories - إنشاء فئة جديدة (متاح فقط للمسؤولين)
 * PUT /api/categories/:id - تحديث فئة (متاح فقط للمسؤولين)
 * DELETE /api/categories/:id - حذف فئة (متاح فقط للمسؤولين)
 */

// مسار الحصول على جميع الفئات (متاح للجميع)
router.get('/', async (req, res) => {
  await controller.listCategories(req, res);
});

// مسار الحصول على فئة بواسطة الاسم المستعار (slug)
// يجب أن يكون قبل مسار المعرف (:id) لتجنب تفسير الـ slug كمعرف
router.get('/slug/:slug', async (req, res) => {
  await controller.getCategoryBySlug(req, res);
});

// مسار الحصول على فئة بواسطة المعرف
router.get('/:id', async (req, res) => {
  await controller.getCategoryById(req, res);
});

// مسار إنشاء فئة جديدة (متاح فقط للمسؤولين)
router.post('/', isAdmin, async (req, res) => {
  await controller.createCategory(req, res);
});

// مسار تحديث فئة (متاح فقط للمسؤولين)
router.put('/:id', isAdmin, async (req, res) => {
  await controller.updateCategory(req, res);
});

// مسار حذف فئة (متاح فقط للمسؤولين)
router.delete('/:id', isAdmin, async (req, res) => {
  await controller.deleteCategory(req, res);
});

export default router;