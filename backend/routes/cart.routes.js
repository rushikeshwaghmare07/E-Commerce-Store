import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import { getCartProducts } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", protectRoute, getCartProducts);

export default router;
