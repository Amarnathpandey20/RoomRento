const express = require('express');
const router = express.Router();
const reportCtrl = require('../controllers/reportController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/role');
const validate = require('../middlewares/validate');
const { resolveReportSchema } = require('../validators/reportValidator');

router.use(protect);

router.get('/', authorize('admin'), reportCtrl.getReports);
router.patch('/:id', authorize('admin'), validate(resolveReportSchema), reportCtrl.resolveReport);

module.exports = router;
