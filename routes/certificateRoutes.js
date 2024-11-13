const express = require('express');
const certificateController = require('../controllers/certificateController');

const router = express.Router();

router.post('/sign', certificateController.sign);
router.post('/verify', certificateController.verifyCertificate)
router.post('/revoke', certificateController.revokeCertificate)

module.exports = router;
