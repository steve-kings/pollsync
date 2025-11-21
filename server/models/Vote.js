const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true
    },
    position: {
        type: String,
        required: true
    },
    voterId: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, { timestamps: true });

// Ensure a voter can only vote once per position in an election
VoteSchema.index({ election: 1, voterId: 1, position: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);
