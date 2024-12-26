const ServiceManagement = require('./serviceManagement.model');

const getAllServices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      title,
    } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    let filter = {};

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    const totalServicesCount = await ServiceManagement.countDocuments(filter);
    const services = await ServiceManagement.find(filter)
      .skip(skip)
      .limit(pageSize);

    const totalPages = Math.ceil(totalServicesCount / pageSize);
    const remainingPages = Math.max(totalPages - pageNumber, 0);

    return res.status(200).json({
      success: true,
      message: "Services retrieved successfully",
      services,
      meta: {
        totalServicesCount,
        currentPage: pageNumber,
        totalPages,
        remainingPages,
        pageSize: services.length,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error", details: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await ServiceManagement.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Service retrieved successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      details: error.message,
    });
  }
};

const createService = async (req, res) => {
  try {
    const { title, description, category,price } = req.body;
    const userId = req.userId
    const service = new ServiceManagement({ title, description, category,createdBy:userId,price });
    await service.save();
    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating service",
      details: error.message,
    });
  }
};

const updateService = async (req, res) => {
  try {
    const { title, description, category,price,status } = req.body;
    const service = await ServiceManagement.findByIdAndUpdate(
      req.params.id,
      { title, description, category,price,status},
      { new: true }
    );
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating service",
      details: error.message,
    });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await ServiceManagement.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting service",
      details: error.message,
    });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
