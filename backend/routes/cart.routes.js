import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import { getCartProducts, addToCart, updateCartItemQuantity, removeFromCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeFromCart);
router.put("/:id", protectRoute, updateCartItemQuantity);

export default router;
