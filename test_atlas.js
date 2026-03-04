require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

if (!uri || uri.includes('<db_password>')) {
    console.error('\n❌ ERROR: Your MongoDB password is not set!');
    console.log('Please open your .env file and replace <db_password> with your actual password.\n');
    process.exit(1);
}

console.log('⏳ Connecting to MongoDB Atlas...');

mongoose.connect(uri)
    .then(() => {
        console.log('\n✅ SUCCESS: Connected to MongoDB Atlas!');
        console.log('Your database is ready for Search History and GPS logging.\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ CONNECTION FAILED!');
        console.error('Reason:', err.message);
        console.log('\nPlease check your internet connection and ensure your IP is whitelisted in MongoDB Atlas.\n');
        process.exit(1);
    });
