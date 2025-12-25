// const mongoose = require('mongoose');
// // MongoDB connection function

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//     console.log(`📊 Database: ${conn.connection.name}`);
//   } catch (error) {
//     console.error('❌ MongoDB connection error:', error.message);
//     process.exit(1);
//   }
// };

// // Handle connection events
// mongoose.connection.on('disconnected', () => {
//   console.log('⚠️  MongoDB disconnected');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('❌ MongoDB error:', err);
// });

// process.on('SIGINT', async () => {
//   await mongoose.connection.close();
//   console.log('MongoDB connection closed due to app termination');
//   process.exit(0);
// });

// module.exports = connectDB;


const connectDB = async () => {
  console.log('⚠️ MongoDB temporarily disabled - using in-memory storage');
  console.log('✅ Server ready (without database)');
};

module.exports = connectDB;