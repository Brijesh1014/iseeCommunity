const Contract = require("./contract.model");
const pdfkit = require("pdfkit");
const fs = require("fs");
const path = require("path");

const createContract = async (req, res) => {
  try {
    const { orderId, services, contractDescription, duration } = req.body;
    const userId = req.userId;

    // Generate contract number
    const contractNumber = `CONTRACT-${new Date().getTime()}`;

    const contract = new Contract({
      contractNumber,
      userId,
      services,
      contractDescription,
      duration,
      status: "Active",
      paymentStatus: "Completed", // Assuming payment is completed
    });

    await contract.save();

    // Generate contract PDF
    const doc = new pdfkit();
    const pdfFilePath = path.join(
      __dirname,
      `contracts/contract-${contractNumber}.pdf`
    );
    doc.pipe(fs.createWriteStream(pdfFilePath));

    doc
      .fontSize(16)
      .text(`Contract Number: ${contract.contractNumber}`, { align: "center" });
    doc
      .fontSize(12)
      .text(`Contract Date: ${new Date().toLocaleDateString()}`, {
        align: "left",
      });
    doc.text(`Contract Duration: ${contract.duration} months`, {
      align: "left",
    });
    doc.text(`Contract Description: ${contract.contractDescription}`, {
      align: "left",
    });

    doc.text("\nServices:");
    contract.services.forEach((service) => {
      doc.text(
        `- Service: ${service.serviceId.title} | Price: $${service.price}`
      );
    });

    doc.end();

    res.status(201).json({
      success: true,
      message: "Contract created successfully. PDF generated.",
      contract,
      contractPdfPath: pdfFilePath,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating contract.",
      details: error.message,
    });
  }
};

const getContractsByUser = async (req, res) => {
  try {
    const userId = req.userId;

    const contracts = await Contract.find({ userId }).populate(
      "services.serviceId",
      "title price"
    );

    res.status(200).json({
      success: true,
      message: "Contracts retrieved successfully.",
      contracts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching contracts.",
      details: error.message,
    });
  }
};

const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).populate(
      "services.serviceId",
      "title price"
    );

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contract details retrieved successfully.",
      contract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching contract details.",
      details: error.message,
    });
  }
};

module.exports = {
  createContract,
  getContractsByUser,
  getContractById,
};
