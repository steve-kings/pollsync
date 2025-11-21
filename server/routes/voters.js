const express = require('express');
const router = express.Router({ mergeParams: true });
const { importVoters, getVoters, deleteVoter, addVoter } = require('../controllers/voterController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/csvUpload');

router.get('/', protect, getVoters);
router.post('/', protect, addVoter);
router.post('/import', protect, upload.single('file'), importVoters);
router.delete('/:voterId', protect, deleteVoter);

module.exports = router;
