import mongoose from "mongoose";

export const connectDB = async () => {
  const conn = await mongoose.connect(`${process.env.MONGO_URI}/newsletter`);

  console.log(`MongoDB Connected: ${conn.connection.host}`);
};
