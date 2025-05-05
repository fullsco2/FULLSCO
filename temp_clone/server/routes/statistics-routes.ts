import { Router } from 'express';
import { StatisticsController } from '../controllers/statistics-controller';
import { isAdmin, isAuthenticated } from '../middlewares/auth-middleware';

const router = Router();
const controller = new StatisticsController();

/**
 * @route   GET /api/statistics
 * @desc    الحصول على جميع الإحصائيات
 * @access  Public
 */
router.get('/', async (req, res) => controller.listStatistics(req, res));

/**
 * @route   GET /api/statistics/:id
 * @desc    الحصول على إحصائية بواسطة المعرف
 * @access  Public
 */
router.get('/:id', async (req, res) => controller.getStatistic(req, res));

/**
 * @route   POST /api/statistics
 * @desc    إنشاء إحصائية جديدة
 * @access  Admin
 */
router.post('/', isAuthenticated, isAdmin, async (req, res) => controller.createStatistic(req, res));

/**
 * @route   PUT /api/statistics/:id
 * @desc    تحديث إحصائية موجودة
 * @access  Admin
 */
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => controller.updateStatistic(req, res));

/**
 * @route   DELETE /api/statistics/:id
 * @desc    حذف إحصائية
 * @access  Admin
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => controller.deleteStatistic(req, res));

/**
 * @route   POST /api/statistics/reorder
 * @desc    تغيير ترتيب الإحصائيات
 * @access  Admin
 */
router.post('/reorder', isAuthenticated, isAdmin, async (req, res) => controller.reorderStatistics(req, res));

export default router;