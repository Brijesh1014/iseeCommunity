const Order = require("./order.model");
const ServiceManagement = require("../serviceManagement/serviceManagement.model");

const createOrder = async (req, res) => {
  try {
    const { services } = req.body; // Array of service IDs
    const userId = req.userId;

    if (!services || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one service is required to create an order.",
      });
    }

    let totalAmount = 0;
    const serviceDetails = [];

    for (const service of services) {
      const serviceData = await ServiceManagement.findById(service.serviceId);

      if (!serviceData || serviceData.status !== "Activate") {
        return res.status(404).json({
          success: false,
          message: `Service with ID ${service.serviceId} is not available.`,
        });
      }

      const price = parseFloat(serviceData.price);
      totalAmount += price;

      serviceDetails.push({
        serviceId: service.serviceId,
        price,
      });
    }

    const order = new Order({
      userId,
      services: serviceDetails,
      totalAmount,
      paymentStatus: "Pending",
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully. Proceed to payment.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating order.",
      details: error.message,
    });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ userId }).populate(
      "services.serviceId",
      "title description price"
    );

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully.",
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders.",
      details: error.message,
    });
  }
};

module.exports = {
    createOrder,
    getOrdersByUser
}
