import { Router } from 'express';
import { ScholarshipsController } from '../controllers/scholarships-controller';
import { isAdmin } from '../middlewares/auth-middleware';

const router = Router();
const controller = new ScholarshipsController();

// الحصول على قائمة المنح الدراسية
router.get('/', (req, res) => controller.listScholarships(req, res));

// الحصول على المنح الدراسية المميزة
router.get('/featured', (req, res) => controller.getFeaturedScholarships(req, res));

// الحصول على منحة دراسية بواسطة المعرف
router.get('/:id([0-9]+)', (req, res) => controller.getScholarshipById(req, res));

// الحصول على منحة دراسية بواسطة الاسم المستعار
router.get('/slug/:slug', (req, res) => controller.getScholarshipBySlug(req, res));

// إنشاء منحة دراسية جديدة (يتطلب صلاحيات المسؤول)
router.post('/', isAdmin, (req, res) => controller.createScholarship(req, res));

// تحديث منحة دراسية (يتطلب صلاحيات المسؤول)
router.put('/:id', isAdmin, (req, res) => controller.updateScholarship(req, res));

// تحديث جزئي لمنحة دراسية (يتطلب صلاحيات المسؤول)
router.patch('/:id', isAdmin, (req, res) => controller.updateScholarship(req, res));

// حذف منحة دراسية (يتطلب صلاحيات المسؤول)
router.delete('/:id', isAdmin, (req, res) => controller.deleteScholarship(req, res));

export default router;