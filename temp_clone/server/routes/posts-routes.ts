import { Router } from 'express';
import { PostsController } from '../controllers/posts-controller';
import { isAdmin } from '../middlewares/auth-middleware';

const router = Router();
const controller = new PostsController();

// الحصول على قائمة المقالات
router.get('/', (req, res) => controller.listPosts(req, res));

// الحصول على مقال بواسطة المعرف
router.get('/:id([0-9]+)', (req, res) => controller.getPostById(req, res));

// الحصول على مقال بواسطة الاسم المستعار
router.get('/slug/:slug', (req, res) => controller.getPostBySlug(req, res));

// الحصول على المقالات حسب علامة
router.get('/tag/:slug', (req, res) => controller.getPostsByTag(req, res));

// الحصول على علامات مقال
router.get('/:id/tags', (req, res) => controller.getPostTags(req, res));

// إنشاء مقال جديد (يتطلب صلاحيات المسؤول)
router.post('/', isAdmin, (req, res) => controller.createPost(req, res));

// إضافة علامة إلى مقال (يتطلب صلاحيات المسؤول)
router.post('/:postId/tags/:tagId', isAdmin, (req, res) => controller.addTagToPost(req, res));

// تحديث مقال (يتطلب صلاحيات المسؤول)
router.put('/:id', isAdmin, (req, res) => controller.updatePost(req, res));

// تحديث جزئي لمقال (يتطلب صلاحيات المسؤول)
router.patch('/:id', isAdmin, (req, res) => controller.updatePost(req, res));

// حذف مقال (يتطلب صلاحيات المسؤول)
router.delete('/:id', isAdmin, (req, res) => controller.deletePost(req, res));

// إزالة علامة من مقال (يتطلب صلاحيات المسؤول)
router.delete('/:postId/tags/:tagId', isAdmin, (req, res) => controller.removeTagFromPost(req, res));

export default router;