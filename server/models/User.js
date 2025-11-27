const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'organizer', 'voter'],
        default: 'organizer'
    },
    subscriptionStatus: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },
    // Shared credit pool (for non-unlimited packages)
    sharedCredits: {
        type: Number,
        default: 0  // Total voter credits available across all elections
    },
    // Unlimited packages (one-time use per election)
    unlimitedPackages: [{
        transactionId: String,
        purchaseDate: { type: Date, default: Date.now },
        used: { type: Boolean, default: false },
        electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', default: null }
    }],
    // Credit purchase history
    creditHistory: [{
        plan: String,
        credits: Number,  // Voter credits added
        price: Number,
        transactionId: String,
        purchaseDate: { type: Date, default: Date.now },
        isUnlimited: { type: Boolean, default: false }
    }],
    // Legacy field for backward compatibility
    electionCredits: [{
        plan: {
            type: String,
            enum: ['free', 'starter', 'standard', 'unlimited'],
            required: true
        },
        voterLimit: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        electionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Election',
            default: null
        },
        transactionId: {
            type: String,
            default: ''
        },
        paymentDate: {
            type: Date,
            default: Date.now
        },
        purchaseDate: {
            type: Date,
            default: Date.now
        },
        used: {
            type: Boolean,
            default: false
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual field: Election packages count
UserSchema.virtual('totalElectionPackages').get(function() {
    return this.electionCredits ? this.electionCredits.length : 0;
});

// Virtual field: Available election packages
UserSchema.virtual('availableElectionPackages').get(function() {
    return this.electionCredits ? this.electionCredits.filter(c => !c.used).length : 0;
});

// NEW METHODS: Shared Credit System

// Method: Get credit summary (NEW SYSTEM with LEGACY support)
UserSchema.methods.getCreditSummary = function() {
    const availableUnlimited = this.unlimitedPackages ? this.unlimitedPackages.filter(p => !p.used).length : 0;
    const usedUnlimited = this.unlimitedPackages ? this.unlimitedPackages.filter(p => p.used).length : 0;
    const lowCredits = (this.sharedCredits || 0) < 10;
    
    // Check legacy packages for backward compatibility
    const legacyAvailable = this.electionCredits ? this.electionCredits.filter(c => !c.used).length : 0;
    
    // User can create election if they have: shared credits OR unlimited packages OR legacy packages
    const canCreate = (this.sharedCredits || 0) > 0 || availableUnlimited > 0 || legacyAvailable > 0;
    const needsCredits = (this.sharedCredits || 0) === 0 && availableUnlimited === 0 && legacyAvailable === 0;
    
    return {
        sharedCredits: this.sharedCredits || 0,
        unlimitedPackages: {
            available: availableUnlimited,
            used: usedUnlimited,
            total: (this.unlimitedPackages || []).length
        },
        lowCredits: lowCredits && legacyAvailable === 0,
        canCreateElection: canCreate,
        needsCredits: needsCredits,
        warning: lowCredits && availableUnlimited === 0 && legacyAvailable === 0 ? 'Your credits are running low. Consider purchasing more.' : null,
        // Legacy support
        electionPackages: {
            total: this.electionCredits ? this.electionCredits.length : 0,
            available: legacyAvailable,
            used: this.electionCredits ? this.electionCredits.filter(c => c.used).length : 0
        }
    };
};

// Method: Check if user can create election (with LEGACY support)
UserSchema.methods.canCreateElection = function() {
    const hasSharedCredits = (this.sharedCredits || 0) > 0;
    const hasUnlimitedPackages = this.unlimitedPackages && this.unlimitedPackages.some(p => !p.used);
    const hasLegacyPackages = this.electionCredits && this.electionCredits.some(c => !c.used);
    
    return hasSharedCredits || hasUnlimitedPackages || hasLegacyPackages;
};

// Method: Deduct credits for election
UserSchema.methods.deductCredits = function(voterCount) {
    if ((this.sharedCredits || 0) >= voterCount) {
        this.sharedCredits -= voterCount;
        return { success: true, creditsUsed: voterCount, remaining: this.sharedCredits };
    }
    return { success: false, message: 'Insufficient credits', available: this.sharedCredits || 0 };
};

// Method: Use unlimited package
UserSchema.methods.useUnlimitedPackage = function(electionId) {
    const availablePackage = this.unlimitedPackages ? this.unlimitedPackages.find(p => !p.used) : null;
    if (availablePackage) {
        availablePackage.used = true;
        availablePackage.electionId = electionId;
        return { success: true, package: availablePackage };
    }
    return { success: false, message: 'No unlimited packages available' };
};

// Method: Add credits (for purchases)
UserSchema.methods.addCredits = function(credits, transactionDetails) {
    this.sharedCredits = (this.sharedCredits || 0) + credits;
    if (!this.creditHistory) this.creditHistory = [];
    this.creditHistory.push({
        plan: transactionDetails.plan,
        credits: credits,
        price: transactionDetails.price,
        transactionId: transactionDetails.transactionId,
        purchaseDate: new Date(),
        isUnlimited: false
    });
    return this.sharedCredits;
};

// Method: Add unlimited package
UserSchema.methods.addUnlimitedPackage = function(transactionDetails) {
    if (!this.unlimitedPackages) this.unlimitedPackages = [];
    this.unlimitedPackages.push({
        transactionId: transactionDetails.transactionId,
        purchaseDate: new Date(),
        used: false,
        electionId: null
    });
    if (!this.creditHistory) this.creditHistory = [];
    this.creditHistory.push({
        plan: 'unlimited',
        credits: -1,  // -1 indicates unlimited
        price: transactionDetails.price,
        transactionId: transactionDetails.transactionId,
        purchaseDate: new Date(),
        isUnlimited: true
    });
    return this.unlimitedPackages.length;
};

// LEGACY METHOD: Check if user has available election package (for backward compatibility)
UserSchema.methods.hasAvailablePackage = function() {
    return this.canCreateElection();
};

// Ensure virtuals are included in JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);
