import { NextFunction, Response } from "express";
import { ExtendRequest } from "../types/extendedRequest";

// Runs after validateJWT, which puts the matching user document on the request.
const validateAdmin = (req: ExtendRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(403).send("User not found");
    return;
  }

  if (!req.user.isAdmin) {
    res.status(403).send("Admin access is required");
    return;
  }

  next();
};

export default validateAdmin;
