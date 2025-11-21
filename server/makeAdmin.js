const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function makeAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pollsync');
        console.log('MongoDB Connected');

        const user = await User.findOne({ email: 'Kingscreationagency635@gmail.com' });

        if (user) {
            user.role = 'admin';
            await user.save();
            console.log('User role updated to admin successfully!');
            console.log('User:', {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            });
        } else {
            console.log('User not found');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

makeAdmin();
