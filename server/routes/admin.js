const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    deleteUser,
    updateUserRole,
    getAllElections,
    deleteElection,
    getSystemStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Protect all routes and require admin role
router.use(protect);
router.use(admin);

// User management routes
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

// Election management routes
router.get('/elections', getAllElections);
router.delete('/elections/:id', deleteElection);

// Statistics route
router.get('/stats', getSystemStats);

module.exports = router;
