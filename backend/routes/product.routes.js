import express from "express";
import { createProduct, deleteProduct, getAllProducts, getFeaturedProducts, getRecommendedProducts, getProductsByCategory } from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, adminRoute, createProduct);
router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured",  getFeaturedProducts);
router.get("/recommendations",  getRecommendedProducts);
router.get("/category/:category", getProductsByCategory);
router.delete("/:id", protectRoute, adminRoute ,deleteProduct);

export default router;
