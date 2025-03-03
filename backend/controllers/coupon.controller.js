import Coupon from "../models/coupon.model";

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });

    if (coupon) {
      return res.status(200).json({
        success: true,
        message: "Coupon retrieved successfully",
        coupon,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }
  } catch (error) {
    console.log("Error in getCoupon controller:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
