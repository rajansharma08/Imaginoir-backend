import mongoose from "mongoose";

const connectDB = (url) => {
  if (!url) {
    console.error("❌ MongoDB connection URL is missing!");
    return;
  }

  mongoose.set("strictQuery", true);

  mongoose
    .connect(url)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
      console.error("❌ Failed to connect to MongoDB");
      console.error("Error:", err.message || err);
    });
};

export default connectDB;
