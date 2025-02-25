import { json } from "express";
import Product from "../models/product.model.js";
import cloudinary from "../utils/cloudinary.js";
import redis from "../utils/redis.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    let cloudinaryResponse = null;

    if (image) {
      try {
        cloudinaryResponse = await cloudinary.uploader.upload(image, {
          folder: "products",
        });
      } catch (uploadError) {
        console.log("Cloudinary upload error:", uploadError.message);
        return res.status(500).json({
          success: false,
          message: "Image upload failed.",
        });
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products available.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All products retrieved successfully.",
      products: products,
    });
  } catch (error) {
    console.log("Error in getAllProduct controller:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.status(200).json({
        success: true,
        message: "Featured products retrieved from cache.",
        products: JSON.parse(featuredProducts),
      });
    }

    // Fetch from database if not cached
    featuredProducts = await Product.find({ isFeatured: true }).lean(); // lean is used to convert the mongoose object to a plain javascript object
    if (featuredProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No featured products found.",
      });
    }

    // Store in Redis with expiration
    await redis.set(
      "featured_products",
      JSON.stringify(featuredProducts),
      "EX",
      3600
    );

    return res.status(200).json({
      success: true,
      message: "Featured products retrieved successfully.",
      products: featuredProducts,
    });
  } catch (error) {
    console.log("Error in getFeaturedProducts controller:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
