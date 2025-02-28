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

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Delete image from Cloudinary
    if (product.image) {
      const publicId = product.image?.split("/")?.pop()?.split(".")?.[0];
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`products/${publicId}`);
          console.log("Image deleted from Cloudinary");
        } catch (error) {
          console.log(
            "Error in deleting image from Cloudinary:",
            error.message
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.log("Error in deleteProduct controller:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 4 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Recommended products retrieved successfully.",
      products,
    });
  } catch (error) {
    console.log("Error in getRecommendedProducts controller:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required.",
      });
    }

    const products = await Product.find({ category });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for the specified category.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      products,
    });
  } catch (error) {
    console.log("Error in getProductsByCategory controller:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
