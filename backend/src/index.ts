import dotenv from "dotenv";

import path from "path";
import express from "express";
import mongoose from "mongoose";
import userRoute from "./routes/userRoute";
import productRoute from "./routes/productRoute";
import cartRoute from "./routes/cartRoute";
import adminRoute from "./routes/adminRoute";
import { seedInitialProducts } from "./services/productService";
import { seedAdminUser } from "./services/userService";
import { UPLOADS_DIR } from "./middlewares/uploadImage";
import cors from "cors";

dotenv.config();

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

// Product images uploaded from the admin dashboard.
app.use("/uploads", express.static(UPLOADS_DIR));

app.use("/user", userRoute);
app.use("/product", productRoute);
app.use("/cart", cartRoute);
app.use("/admin", adminRoute);

// Serve the built frontend (run `npm run build` in frontend2/ first).
const FRONTEND_DIST = path.join(__dirname, "../../frontend2/dist");
app.use(express.static(FRONTEND_DIST));

// SPA fallback: any non-API route falls through to index.html so React Router can handle it.
app.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

const startServer = async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not set in the environment");
    }

    await mongoose.connect(databaseUrl);
    console.log("Mongo connected!");

    await seedInitialProducts();
    await seedAdminUser();

    app.listen(port, () => {
      console.log(`Server is running at: http://localhost:${port}`);
    });
  } catch (err) {
    console.log("Failed to connect!", err);
  }
};

void startServer();
