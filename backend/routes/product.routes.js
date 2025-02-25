import express from "express";
import { createProduct, getAllProducts, getFeaturedProducts } from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, adminRoute, createProduct);
router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured",  getFeaturedProducts);

export default router;
