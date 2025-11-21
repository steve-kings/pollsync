const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String
    },
    manifesto: {
        type: String
    },
    voteCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', CandidateSchema);
