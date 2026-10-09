import express from "express";
import { getDashboardStats } from "../services/adminService";
import validateJWT from "../middlewares/validateJWT";
import validateAdmin from "../middlewares/validateAdmin";
import { ExtendRequest } from "../types/extendedRequest";

const router = express.Router();

router.get(
  "/stats",
  validateJWT,
  validateAdmin,
  async (req: ExtendRequest, res) => {
    try {
      const { statusCode, data } = await getDashboardStats();
      res.status(statusCode).send(data);
    } catch (err) {
      console.error(err);
      res.status(500).send("Something went wrong!");
    }
  }
);

export default router;
