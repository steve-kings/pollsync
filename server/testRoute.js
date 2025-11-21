const axios = require('axios');

const testAdminRoute = async () => {
    try {
        console.log('Testing admin route...');
        const response = await axios.get('http://localhost:5000/api/admin/stats');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
};

testAdminRoute();
