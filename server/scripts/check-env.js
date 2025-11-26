// Environment variables checker for deployment
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'EMAIL_USER',
    'EMAIL_APP_PASSWORD',
    'KOPOKOPO_CLIENT_ID',
    'KOPOKOPO_CLIENT_SECRET',
    'KOPOKOPO_API_KEY'
];

const optionalEnvVars = [
    'PORT',
    'NODE_ENV',
    'FRONTEND_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

console.log('🔍 Checking environment variables...\n');

let missingRequired = [];
let missingOptional = [];

// Check required variables
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        missingRequired.push(varName);
        console.log(`❌ ${varName}: MISSING (REQUIRED)`);
    } else {
        console.log(`✅ ${varName}: Set`);
    }
});

console.log('\n📋 Optional variables:');

// Check optional variables
optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        missingOptional.push(varName);
        console.log(`⚠️  ${varName}: Not set (using default)`);
    } else {
        console.log(`✅ ${varName}: Set`);
    }
});

console.log('\n' + '='.repeat(50));

if (missingRequired.length > 0) {
    console.log('\n❌ DEPLOYMENT BLOCKED!');
    console.log('Missing required environment variables:');
    missingRequired.forEach(v => console.log(`   - ${v}`));
    console.log('\nPlease set these variables before deploying.');
    process.exit(1);
} else {
    console.log('\n✅ All required environment variables are set!');
    console.log('✅ Ready for deployment!');
    
    if (missingOptional.length > 0) {
        console.log('\n⚠️  Optional variables not set:');
        missingOptional.forEach(v => console.log(`   - ${v}`));
        console.log('These will use default values.');
    }
    
    process.exit(0);
}
