const serviceManagementModel = require("../serviceManagement/serviceManagement.model");
const Quote = require("./quote.model");

const createQuote = async (req, res) => {
    try {
      const { name, email, contactNumber, description, serviceId } = req.body;
      const userId = req.userId;
  
      if (!name || !email || !contactNumber || !description) {
        return res.status(400).json({
          success: false,
          message: "All fields are required"
        });
      }
  
      const existingServices = await serviceManagementModel.find({ _id: { $in: serviceId } });
      if (existingServices.length !== serviceId.length) {
        return res.status(400).json({
          success: false,
          message: "One or more provided service IDs are invalid",
        });
      }
  
      const quote = new Quote({
        name,
        email,
        contactNumber,
        description,
        serviceId,
        createdBy: userId,
      });
      await quote.save();
  
      res.status(201).json({
        success: true,
        message: "Quote created successfully. Admin will connect with them over the call or email.",
        quote,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error submitting quote",
        details: error.message,
      });
    }
  };

const getAllQuotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, name, email } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (email) {
      filter.email = { $regex: email, $options: "i" };
    }

    const totalQuotesCount = await Quote.countDocuments(filter);
    const quotes = await Quote.find(filter).skip(skip).limit(pageSize).populate("serviceId");

    const totalPages = Math.ceil(totalQuotesCount / pageSize);
    const remainingPages = Math.max(totalPages - pageNumber, 0);

    res.status(200).json({
      success: true,
      message: "Quotes retrieved successfully",
      quotes,
      meta: {
        totalQuotesCount,
        currentPage: pageNumber,
        totalPages,
        remainingPages,
        pageSize: quotes.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching quotes",
      details: error.message,
    });
  }
};

const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id).populate("serviceId");;
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Quote retrieved successfully",
      quote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching quote",
      details: error.message,
    });
  }
};

const deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findByIdAndDelete(req.params.id);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Quote deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting quote",
      details: error.message,
    });
  }
};

module.exports = {
    createQuote,
    getAllQuotes,
    getQuoteById,
    deleteQuote
}