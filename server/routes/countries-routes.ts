import { Router } from 'express';
import { CountriesController } from '../controllers/countries-controller';
import { isAdmin, isAuthenticated } from '../middlewares/auth-middleware';

// إنشاء موجه (router) جديد
const router = Router();
const controller = new CountriesController();

/**
 * مسارات الدول:
 * GET /api/countries - الحصول على جميع الدول
 * GET /api/countries/:id - الحصول على دولة بواسطة المعرف
 * GET /api/countries/slug/:slug - الحصول على دولة بواسطة الاسم المستعار
 * POST /api/countries - إنشاء دولة جديدة (متاح فقط للمسؤولين)
 * PUT /api/countries/:id - تحديث دولة (متاح فقط للمسؤولين)
 * DELETE /api/countries/:id - حذف دولة (متاح فقط للمسؤولين)
 */

// مسار الحصول على جميع الدول (متاح للجميع)
router.get('/', async (req, res) => {
  await controller.listCountries(req, res);
});

// مسار الحصول على دولة بواسطة الاسم المستعار (slug)
// يجب أن يكون قبل مسار المعرف (:id) لتجنب تفسير الـ slug كمعرف
router.get('/slug/:slug', async (req, res) => {
  await controller.getCountryBySlug(req, res);
});

// مسار الحصول على دولة بواسطة المعرف
router.get('/:id', async (req, res) => {
  await controller.getCountryById(req, res);
});

// مسار إنشاء دولة جديدة (متاح فقط للمسؤولين)
router.post('/', isAdmin, async (req, res) => {
  await controller.createCountry(req, res);
});

// مسار تحديث دولة (متاح فقط للمسؤولين)
router.put('/:id', isAdmin, async (req, res) => {
  await controller.updateCountry(req, res);
});

// مسار حذف دولة (متاح فقط للمسؤولين)
router.delete('/:id', isAdmin, async (req, res) => {
  await controller.deleteCountry(req, res);
});

export default router;