import { Router } from 'express';
import { PartnersController } from '../controllers/partners-controller';
import { isAdmin } from '../middlewares/auth-middleware';

const router = Router();
const controller = new PartnersController();

// الحصول على قائمة الشركاء
router.get('/', (req, res) => controller.listPartners(req, res));

// الحصول على شريك بواسطة المعرف
router.get('/:id', (req, res) => controller.getPartnerById(req, res));

// إنشاء شريك جديد (يتطلب صلاحيات المسؤول)
router.post('/', isAdmin, (req, res) => controller.createPartner(req, res));

// تحديث شريك (يتطلب صلاحيات المسؤول)
router.put('/:id', isAdmin, (req, res) => controller.updatePartner(req, res));

// تحديث جزئي لشريك (يتطلب صلاحيات المسؤول)
router.patch('/:id', isAdmin, (req, res) => controller.updatePartner(req, res));

// حذف شريك (يتطلب صلاحيات المسؤول)
router.delete('/:id', isAdmin, (req, res) => controller.deletePartner(req, res));

export default router;