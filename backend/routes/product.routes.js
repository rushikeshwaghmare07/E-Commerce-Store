import express from "express";
import { createProduct, getAllProducts } from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, adminRoute, createProduct);
router.get("/", protectRoute, adminRoute, getAllProducts);

export default router;
