const User = require('../models/User');
const Election = require('../models/Election');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        console.log('Fetching all users...');
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        console.log(`Found ${users.length} users`);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['admin', 'organizer'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({ message: 'User role updated successfully', user: { ...user.toObject(), password: undefined } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all elections (Admin only)
// @route   GET /api/admin/elections
// @access  Private/Admin
exports.getAllElections = async (req, res) => {
    try {
        const elections = await Election.find()
            .populate('organizer', 'username email')
            .sort({ createdAt: -1 });
        res.json(elections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete election (Admin only)
// @route   DELETE /api/admin/elections/:id
// @access  Private/Admin
exports.deleteElection = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);

        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        await election.deleteOne();
        res.json({ message: 'Election deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system statistics (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getSystemStats = async (req, res) => {
    try {
        const Election = require('../models/Election');
        const Vote = require('../models/Vote');

        const totalUsers = await User.countDocuments();
        const totalElections = await Election.countDocuments();
        const activeElections = await Election.countDocuments({ status: 'active' });
        const totalVotes = await Vote.countDocuments();

        res.json({
            totalUsers,
            totalElections,
            activeElections,
            totalVotes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
