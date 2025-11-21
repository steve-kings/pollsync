const mongoose = require('mongoose');

const AllowedVoterSchema = new mongoose.Schema({
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    email: {
        type: String
    }
}, { timestamps: true });

// Ensure a student ID is unique per election
AllowedVoterSchema.index({ election: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('AllowedVoter', AllowedVoterSchema);
