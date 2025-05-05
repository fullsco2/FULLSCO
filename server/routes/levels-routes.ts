import { Router } from 'express';
import { LevelsController } from '../controllers/levels-controller';
import { isAdmin, isAuthenticated } from '../middlewares/auth-middleware';

// إنشاء موجه (router) جديد
const router = Router();
const controller = new LevelsController();

/**
 * مسارات المستويات الدراسية:
 * GET /api/levels - الحصول على جميع المستويات
 * GET /api/levels/:id - الحصول على مستوى بواسطة المعرف
 * GET /api/levels/slug/:slug - الحصول على مستوى بواسطة الاسم المستعار
 * POST /api/levels - إنشاء مستوى جديد (متاح فقط للمسؤولين)
 * PUT /api/levels/:id - تحديث مستوى (متاح فقط للمسؤولين)
 * DELETE /api/levels/:id - حذف مستوى (متاح فقط للمسؤولين)
 */

// مسار الحصول على جميع المستويات (متاح للجميع)
router.get('/', async (req, res) => {
  await controller.listLevels(req, res);
});

// مسار الحصول على مستوى بواسطة الاسم المستعار (slug)
// يجب أن يكون قبل مسار المعرف (:id) لتجنب تفسير الـ slug كمعرف
router.get('/slug/:slug', async (req, res) => {
  await controller.getLevelBySlug(req, res);
});

// مسار الحصول على مستوى بواسطة المعرف
router.get('/:id', async (req, res) => {
  await controller.getLevelById(req, res);
});

// مسار إنشاء مستوى جديد (متاح فقط للمسؤولين)
router.post('/', isAdmin, async (req, res) => {
  await controller.createLevel(req, res);
});

// مسار تحديث مستوى (متاح فقط للمسؤولين)
router.put('/:id', isAdmin, async (req, res) => {
  await controller.updateLevel(req, res);
});

// مسار حذف مستوى (متاح فقط للمسؤولين)
router.delete('/:id', isAdmin, async (req, res) => {
  await controller.deleteLevel(req, res);
});

export default router;