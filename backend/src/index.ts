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
import dns from "dns";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json());

// Some local networks hand out an IPv6 link-local DNS server (fe80::1) that Node's
// resolver can't use, so the mongodb+srv SRV lookup fails with ECONNREFUSED.
// Use public resolvers locally; Render's DNS works fine in production.
if (!isProduction) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

// In development the Vite dev server (5173) calls the API cross-origin.
// In production the API serves the built frontend itself, so no CORS is needed.
if (!isProduction) {
  app.use(cors({ origin: "http://localhost:5173" }));
}

// Product images uploaded from the admin dashboard.
app.use("/uploads", express.static(UPLOADS_DIR));

// API routes live under /api so they never collide with SPA routes (e.g. /cart, /admin).
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/admin", adminRoute);

if (isProduction) {
  // Serve the built frontend (`npm run build` at the project root builds it).
  // Same relative path from src/ (ts-node) and dist/ (compiled).
  const FRONTEND_DIST = path.join(__dirname, "../../frontend2/dist");
  app.use(express.static(FRONTEND_DIST));

  // SPA fallback: any non-API route falls through to index.html so React Router can handle it.
  app.get(/^(?!\/api\/|\/uploads\/).*/, (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
}

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
      console.log(
        `Server is running at: http://localhost:${port} (${isProduction ? "production" : "development"})`
      );
    });
  } catch (err) {
    console.log("Failed to connect!", err);
    process.exit(1);
  }
};

void startServer();
