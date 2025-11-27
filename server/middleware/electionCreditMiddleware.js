const User = require('../models/User');

// Middleware to check if user has available election credits (NEW SHARED CREDIT SYSTEM)
exports.requireElectionCredit = async (req, res, next) => {
    try {
        console.log('=== Election Credit Check (Shared System) ===');
        console.log('User ID:', req.user._id || req.user.id);

        const user = await User.findById(req.user._id || req.user.id);

        if (!user) {
            console.log('ERROR: User not found');
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        console.log('User:', user.username);
        console.log('Shared Credits:', user.sharedCredits || 0);
        console.log('Unlimited Packages:', user.unlimitedPackages ? user.unlimitedPackages.filter(p => !p.used).length : 0);

        // Get credit summary using new method
        const creditSummary = user.getCreditSummary();
        
        // Check if user can create election
        if (!user.canCreateElection()) {
            console.log('ERROR: No credits or unlimited packages available');
            return res.status(403).json({
                success: false,
                message: 'No credits available. Please purchase a plan to create an election.',
                redirectTo: '/pricing',
                creditSummary: creditSummary
            });
        }

        console.log('✅ User can create election');
        console.log('   Shared Credits:', user.sharedCredits || 0);
        console.log('   Available Unlimited Packages:', creditSummary.unlimitedPackages.available);

        // Attach user to request for later use (election controller will handle credit deduction)
        req.userWithCredits = user;
        req.creditSummary = creditSummary;
        next();
    } catch (error) {
        console.error('Election credit check error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
