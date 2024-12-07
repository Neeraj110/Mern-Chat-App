import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongooseConnection = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );

    console.log(
      `MongoDB Connected: ${mongooseConnection.connection.host}`.cyan.underline
    );
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold);
    process.exit(1);
  }
};

export default connectDB;
