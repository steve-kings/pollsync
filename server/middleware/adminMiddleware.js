// Admin authorization middleware
const admin = (req, res, next) => {
    console.log('Admin Middleware - User:', req.user ? req.user.username : 'No user', 'Role:', req.user ? req.user.role : 'N/A');
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

module.exports = { admin };
