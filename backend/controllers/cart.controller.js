import Product from "../models/product.model";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });

    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product.id
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });

    return res.status(200).json({
      success: true,
      message: "Cart products retrieved successfully",
      cartItems,
    });
  } catch (error) {
    console.log("Error in getCartProducts controller:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.log("Error in addToCart controller:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    user.cartItems = user.cartItems.filter((item) => item.id !== productId);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.log("Error in removeFromCart controller:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
