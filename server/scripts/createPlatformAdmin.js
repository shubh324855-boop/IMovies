
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');

async function createPlatformAdmin() {
  const email = 'admin@example.com';

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({ email });

    if (!user) {
      console.log('Admin account not found.');
      return;
    }

    user.role = 'platform_admin';
    await user.save();

    console.log(`Platform admin enabled for ${user.email}`);
  } catch (error) {
    console.error('Admin setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createPlatformAdmin();
