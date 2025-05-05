import { Router } from 'express';
import { SuccessStoriesController } from '../controllers/success-stories-controller';
import { isAdmin } from '../middlewares/auth-middleware';

const router = Router();
const controller = new SuccessStoriesController();

// الحصول على قائمة قصص النجاح
router.get('/', (req, res) => controller.listSuccessStories(req, res));

// الحصول على قصة نجاح بواسطة المعرف
router.get('/:id([0-9]+)', (req, res) => controller.getSuccessStoryById(req, res));

// الحصول على قصة نجاح بواسطة الاسم المستعار
router.get('/slug/:slug', (req, res) => controller.getSuccessStoryBySlug(req, res));

// إنشاء قصة نجاح جديدة (يتطلب صلاحيات المسؤول)
router.post('/', isAdmin, (req, res) => controller.createSuccessStory(req, res));

// تحديث قصة نجاح (يتطلب صلاحيات المسؤول)
router.put('/:id', isAdmin, (req, res) => controller.updateSuccessStory(req, res));

// تحديث جزئي لقصة نجاح (يتطلب صلاحيات المسؤول)
router.patch('/:id', isAdmin, (req, res) => controller.updateSuccessStory(req, res));

// حذف قصة نجاح (يتطلب صلاحيات المسؤول)
router.delete('/:id', isAdmin, (req, res) => controller.deleteSuccessStory(req, res));

export default router;