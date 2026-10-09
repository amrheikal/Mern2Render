import productModel from "../models/productModel";
import userModel from "../models/userModel";
import { orderModel } from "../models/orderModel";

export const getDashboardStats = async () => {
  const [productTotals, orderTotals, totalUsers, outOfStock] =
    await Promise.all([
      productModel.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: "$stock" },
            inventoryValue: { $sum: { $multiply: ["$price", "$stock"] } },
          },
        },
      ]),
      orderModel.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$total" },
          },
        },
      ]),
      userModel.countDocuments(),
      productModel.countDocuments({ stock: { $lte: 0 } }),
    ]);

  return {
    data: {
      totalProducts: productTotals[0]?.totalProducts ?? 0,
      totalStock: productTotals[0]?.totalStock ?? 0,
      inventoryValue: productTotals[0]?.inventoryValue ?? 0,
      outOfStock,
      totalOrders: orderTotals[0]?.totalOrders ?? 0,
      totalRevenue: orderTotals[0]?.totalRevenue ?? 0,
      totalUsers,
    },
    statusCode: 200,
  };
};
