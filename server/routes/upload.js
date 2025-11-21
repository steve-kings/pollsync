const express = require('express');
const router = express.Router();
const { uploadCandidateImage, deleteCandidateImage, uploadElectionThumbnail, deleteElectionThumbnail } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/upload');
const uploadElection = require('../config/electionUpload');

// Upload candidate image
router.post('/candidate', protect, upload.single('image'), uploadCandidateImage);

// Delete candidate image
router.delete('/candidate/:filename', protect, deleteCandidateImage);

// Upload election thumbnail
router.post('/election-thumbnail', protect, uploadElection.single('image'), uploadElectionThumbnail);

// Delete election thumbnail
router.delete('/election-thumbnail/:filename', protect, deleteElectionThumbnail);

module.exports = router;
