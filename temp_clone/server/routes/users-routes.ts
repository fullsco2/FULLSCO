import { Router } from 'express';
import { UsersController } from '../controllers/users-controller';
import { isAdmin, isAuthenticated } from '../middlewares/auth-middleware';

const router = Router();
const controller = new UsersController();

// الحصول على قائمة المستخدمين (للمسؤولين فقط)
router.get('/', isAuthenticated, isAdmin, (req, res) => controller.listUsers(req, res));

// الحصول على مستخدم بواسطة المعرف (للمسؤولين فقط)
router.get('/:id', isAuthenticated, isAdmin, (req, res) => controller.getUserById(req, res));

// إنشاء مستخدم جديد (للمسؤولين فقط)
router.post('/', isAuthenticated, isAdmin, (req, res) => controller.createUser(req, res));

// تحديث بيانات مستخدم (للمسؤولين فقط)
router.put('/:id', isAuthenticated, isAdmin, (req, res) => controller.updateUser(req, res));

// حذف مستخدم (للمسؤولين فقط)
router.delete('/:id', isAuthenticated, isAdmin, (req, res) => controller.deleteUser(req, res));

export default router;