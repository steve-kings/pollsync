const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const checkUsers = async () => {
    try {
        await connectDB();
        const users = await User.find({});
        console.log(`Found ${users.length} users`);
        users.forEach(u => console.log(`- ${u.username} (${u.role})`));
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUsers();
