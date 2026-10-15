const express = require('express');
const router = express.Router();
const visitCtrl = require('../controllers/visitController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { updateVisitSchema } = require('../validators/visitValidator');

router.use(protect);

router.get('/mine', visitCtrl.getMyVisits);
router.patch('/:id', validate(updateVisitSchema), visitCtrl.updateVisit);

module.exports = router;
