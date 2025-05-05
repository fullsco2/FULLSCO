import { Router } from 'express';
import { SiteSettingsController } from '../controllers/site-settings-controller';
import { isAdmin, isAuthenticated } from '../middlewares/auth-middleware';

const router = Router();
const controller = new SiteSettingsController();

// الحصول على إعدادات الموقع (متاح للجميع)
router.get('/', (req, res) => controller.getSiteSettings(req, res));

// تحديث إعدادات الموقع (للمسؤولين فقط)
router.put('/', isAuthenticated, isAdmin, (req, res) => controller.updateSiteSettings(req, res));

export default router;