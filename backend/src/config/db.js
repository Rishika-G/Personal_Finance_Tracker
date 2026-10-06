import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  try {
    await mongoose.connect(uri);
    console.log("[db] connected to MongoDB");
  } catch (err) {
    console.error("[db] connection failed:", err.message);
    process.exit(1);
  }
}
