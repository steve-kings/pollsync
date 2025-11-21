// @desc    Upload candidate image
// @route   POST /api/upload/candidate
// @access  Private
exports.uploadCandidateImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return just the filename to store in database
        // Frontend will construct full URL when displaying: /uploads/candidates/{filename}
        res.status(200).json({
            message: 'Image uploaded successfully',
            filename: req.file.filename,
            path: `/uploads/candidates/${req.file.filename}`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete candidate image
// @route   DELETE /api/upload/candidate/:filename
// @access  Private
exports.deleteCandidateImage = async (req, res) => {
    try {
        const { filename } = req.params;
        const fs = require('fs');
        const path = require('path');

        const filePath = path.join(__dirname, '..', 'uploads', 'candidates', filename);

        // Check if file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload election thumbnail
// @route   POST /api/upload/election-thumbnail
// @access  Private
exports.uploadElectionThumbnail = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return just the filename to store in database
        res.status(200).json({
            message: 'Thumbnail uploaded successfully',
            filename: req.file.filename,
            path: `/uploads/elections/${req.file.filename}`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete election thumbnail
// @route   DELETE /api/upload/election-thumbnail/:filename
// @access  Private
exports.deleteElectionThumbnail = async (req, res) => {
    try {
        const { filename } = req.params;
        const fs = require('fs');
        const path = require('path');

        const filePath = path.join(__dirname, '..', 'uploads', 'elections', filename);

        // Check if file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ message: 'Thumbnail deleted successfully' });
        } else {
            res.status(404).json({ message: 'Thumbnail not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
