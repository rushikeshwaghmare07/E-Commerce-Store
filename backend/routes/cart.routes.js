import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import { getCartProducts, addToCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);

export default router;
