import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import connectDB from "./mongodb/connect.js";
import postRoutes from "./routes/postRoutes.js";
import clipdrop from "./routes/clipDrop.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/v1/post", postRoutes);
app.use("/api/v1/clipdrop", clipdrop);

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Hello from DALL.E!",
  });
});

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);

    const PORT = process.env.PORT || 8080;

    app.listen(PORT, "0.0.0.0", () => 
      console.log(`✅ Server started on port ${PORT}`)
    );
  } catch (error) {
    console.log("❌ Server failed to start:", error);
  }
};


startServer();
