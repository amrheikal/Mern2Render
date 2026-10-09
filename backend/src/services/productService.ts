import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import productModel from "../models/productModel";
import { UPLOADS_DIR } from "../middlewares/uploadImage";

export const getAllProducts = async () => {
  return await productModel.find();
};

// Images uploaded from the dashboard are stored relative to the API root so the
// same document keeps working when the backend moves to another host.
export const buildImagePath = (fileName: string) => `/uploads/${fileName}`;

export const removeUploadedImage = (image?: string) => {
  if (!image || !image.startsWith("/uploads/")) {
    return;
  }

  const filePath = path.join(UPLOADS_DIR, path.basename(image));

  fs.promises.unlink(filePath).catch(() => {
    // The file was already removed (or never stored locally) - nothing to do.
  });
};

interface CreateProductParams {
  title: string;
  image: string;
  price: number;
  stock: number;
}

export const createProduct = async ({
  title,
  image,
  price,
  stock,
}: CreateProductParams) => {
  if (!title || !image) {
    return { data: "Title and image are required!", statusCode: 400 };
  }

  if (isNaN(price) || price <= 0) {
    return { data: "Price must be a number greater than 0!", statusCode: 400 };
  }

  if (isNaN(stock) || stock < 0) {
    return { data: "Stock must be 0 or more!", statusCode: 400 };
  }

  const newProduct = new productModel({ title, image, price, stock });
  await newProduct.save();

  return { data: newProduct, statusCode: 201 };
};

interface UpdateProductParams {
  productId: string;
  title?: string;
  image?: string;
  price?: number;
  stock?: number;
}

export const updateProduct = async ({
  productId,
  title,
  image,
  price,
  stock,
}: UpdateProductParams) => {
  if (!mongoose.isValidObjectId(productId)) {
    return { data: "Product not found!", statusCode: 404 };
  }

  const product = await productModel.findById(productId);

  if (!product) {
    return { data: "Product not found!", statusCode: 404 };
  }

  // Validate everything before touching the document: replacing the image
  // deletes the old file, which must not happen on a rejected update.
  if (price !== undefined && (isNaN(price) || price <= 0)) {
    return { data: "Price must be a number greater than 0!", statusCode: 400 };
  }

  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    return { data: "Stock must be 0 or more!", statusCode: 400 };
  }

  if (title) {
    product.title = title;
  }

  if (price !== undefined) {
    product.price = price;
  }

  if (stock !== undefined) {
    product.stock = stock;
  }

  const previousImage = product.image;

  if (image && image !== previousImage) {
    product.image = image;
  }

  await product.save();

  if (image && image !== previousImage) {
    removeUploadedImage(previousImage);
  }

  return { data: product, statusCode: 200 };
};

interface DeleteProductParams {
  productId: string;
}

export const deleteProduct = async ({ productId }: DeleteProductParams) => {
  if (!mongoose.isValidObjectId(productId)) {
    return { data: "Product not found!", statusCode: 404 };
  }

  const product = await productModel.findById(productId);

  if (!product) {
    return { data: "Product not found!", statusCode: 404 };
  }

  removeUploadedImage(product.image);
  await product.deleteOne();

  return { data: "Product deleted successfully!", statusCode: 200 };
};

export const seedInitialProducts = async () => {
  try {
    const products = [
      {
        title: "Dell Laptop",
        image:
          
          "https://m.media-amazon.com/images/I/61+9ew81AfL._AC_UF1000,1000_QL80_.jpg",
        
        price: 15000,
        stock: 10,
      },
      {
        title: "Asus Laptop",
        image:
          "https://dlcdnwebimgs.asus.com/gain/4cc342ab-c4fa-42a9-8619-a340f6119bec/w800",
        price: 25000,
        stock: 20,
      },
      {
        title: "HP Laptop",
        image:
        "https://www.damencnc.com/userdata/artikelen/plc-s7-1200-cpu-1214c-dc-dc-dc-6es7214-1ag40-0xb0-6537001-en-G.jpg",
        
        price: 40000,
        stock: 8,
      },
    ];

    const existingProducts = await getAllProducts();

    if (existingProducts.length === 0) {
      await productModel.insertMany(products);
    }
  } catch (err) {
    console.error("cannot see database", err);
  }
};
