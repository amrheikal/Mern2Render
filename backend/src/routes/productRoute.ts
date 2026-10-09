import express from "express";
import multer from "multer";
import {
  buildImagePath,
  createProduct,
  deleteProduct,
  getAllProducts,
  removeUploadedImage,
  updateProduct,
} from "../services/productService";
import validateJWT from "../middlewares/validateJWT";
import validateAdmin from "../middlewares/validateAdmin";
import uploadImage from "../middlewares/uploadImage";
import { ExtendRequest } from "../types/extendedRequest";

const router = express.Router();

// Turns multer rejections (wrong type, file too large) into a 400 instead of
// letting them fall through to the generic 500 handler below.
const uploadSingleImage = (req: ExtendRequest, res: express.Response) =>
  new Promise<boolean>((resolve) => {
    uploadImage.single("image")(req, res, (err: unknown) => {
      if (err) {
        const message =
          err instanceof multer.MulterError
            ? `Upload failed: ${err.message}`
            : (err as Error).message || "Upload failed";
        res.status(400).send(message);
        resolve(false);
        return;
      }
      resolve(true);
    });
  });

// The dashboard sends multipart data, so numbers arrive as strings.
const toNumber = (value: unknown) =>
  value === undefined || value === "" ? undefined : Number(value);

router.get("/", async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).send(products);
  } catch {
    res.status(500).send("Something went wrong!");
  }
});

router.post("/", validateJWT, validateAdmin, async (req: ExtendRequest, res) => {
  try {
    const uploaded = await uploadSingleImage(req, res);
    if (!uploaded) return;

    const { title, price, stock, imageUrl } = req.body;
    const image = req.file ? buildImagePath(req.file.filename) : imageUrl;

    const { statusCode, data } = await createProduct({
      title,
      image,
      price: Number(price),
      stock: Number(stock),
    });

    // Multer already wrote the file, so drop it again if the product was rejected.
    if (statusCode >= 400 && req.file) {
      removeUploadedImage(buildImagePath(req.file.filename));
    }

    res.status(statusCode).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong!");
  }
});

router.put(
  "/:id",
  validateJWT,
  validateAdmin,
  async (req: ExtendRequest, res) => {
    try {
      const uploaded = await uploadSingleImage(req, res);
      if (!uploaded) return;

      const { title, price, stock, imageUrl } = req.body;
      const image = req.file ? buildImagePath(req.file.filename) : imageUrl;

      const { statusCode, data } = await updateProduct({
        productId: req.params.id,
        title,
        image,
        price: toNumber(price),
        stock: toNumber(stock),
      });

      if (statusCode >= 400 && req.file) {
        removeUploadedImage(buildImagePath(req.file.filename));
      }

      res.status(statusCode).send(data);
    } catch (err) {
      console.error(err);
      res.status(500).send("Something went wrong!");
    }
  }
);

router.delete(
  "/:id",
  validateJWT,
  validateAdmin,
  async (req: ExtendRequest, res) => {
    try {
      const { statusCode, data } = await deleteProduct({
        productId: req.params.id,
      });
      res.status(statusCode).send(data);
    } catch (err) {
      console.error(err);
      res.status(500).send("Something went wrong!");
    }
  }
);

export default router;
