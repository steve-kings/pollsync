const AllowedVoter = require('../models/AllowedVoter');
const Election = require('../models/Election');
const csv = require('csv-parser');
const fs = require('fs');

// @desc    Import voters from CSV
// @route   POST /api/elections/:id/voters/import
// @access  Private
exports.importVoters = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        if (election.organizer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                // Normalize keys to lowercase to be more forgiving
                const normalizedData = {};
                Object.keys(data).forEach(key => {
                    normalizedData[key.toLowerCase().trim()] = data[key];
                });

                // Look for studentid, student_id, id, etc.
                const studentId = normalizedData['studentid'] || normalizedData['student_id'] || normalizedData['id'];
                const name = normalizedData['name'] || normalizedData['fullname'];
                const email = normalizedData['email'];

                if (studentId) {
                    results.push({
                        election: election._id,
                        studentId: studentId.trim(),
                        name: name ? name.trim() : '',
                        email: email ? email.trim() : ''
                    });
                }
            })
            .on('end', async () => {
                try {
                    if (results.length > 0) {
                        // Use insertMany with ordered: false to skip duplicates
                        await AllowedVoter.insertMany(results, { ordered: false });
                    }

                    // Clean up file
                    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

                    res.json({
                        message: `Processed ${results.length} records. Voters imported successfully.`,
                        count: results.length
                    });
                } catch (error) {
                    // Clean up file
                    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

                    // If duplicate key error (11000), it means some voters already existed
                    if (error.code === 11000 || error.writeErrors) {
                        res.json({
                            message: 'Import completed. Some duplicates were skipped.',
                            count: results.length - (error.writeErrors ? error.writeErrors.length : 0)
                        });
                    } else {
                        console.error('Import error:', error);
                        res.status(500).json({ message: 'Failed to import voters' });
                    }
                }
            })
            .on('error', (error) => {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                res.status(500).json({ message: 'Error reading CSV file' });
            });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a single voter manually
// @route   POST /api/elections/:id/voters
// @access  Private
exports.addVoter = async (req, res) => {
    try {
        const { studentId, name, email } = req.body;

        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        if (election.organizer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const voter = new AllowedVoter({
            election: election._id,
            studentId: studentId.trim(),
            name: name ? name.trim() : '',
            email: email ? email.trim() : ''
        });

        await voter.save();
        res.status(201).json(voter);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'This voter is already on the list' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get allowed voters
// @route   GET /api/elections/:id/voters
// @access  Private
exports.getVoters = async (req, res) => {
    try {
        const voters = await AllowedVoter.find({ election: req.params.id }).sort({ createdAt: -1 });
        res.json(voters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a voter
// @route   DELETE /api/elections/:id/voters/:voterId
// @access  Private
exports.deleteVoter = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (election.organizer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await AllowedVoter.findByIdAndDelete(req.params.voterId);
        res.json({ message: 'Voter removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
